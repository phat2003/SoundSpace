using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpace.Api.Services;
using SoundSpace.Core.Domain.Catalog;
using SoundSpace.Core.Models;
using SoundSpace.Core.Models.Catalog;
using SoundSpace.Core.SeedWorks;
using SoundSpace.Core.SeedWorks.Constants;

namespace SoundSpace.Api.Controllers.AdminApi
{
    // CRUD nghệ sĩ cho trang quản trị (theo PostCategoryController của TeduBlog).
    // Ảnh đại diện / ảnh bìa upload trước qua POST api/admin/media/image?type=artists rồi gửi URL vào đây.
    [Route("api/admin/artist")]
    [ApiController]
    [Authorize(Roles = Roles.Admin)]
    public class ArtistController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;

        public ArtistController(IUnitOfWork unitOfWork,
            IMapper mapper,
            IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
        }

        // status: active (đang hiển thị) / hidden (đang ẩn) / featured (nổi bật); bỏ trống hoặc giá trị khác = tất cả.
        [HttpGet("paging")]
        public async Task<ActionResult<PagedResult<ArtistInListDto>>> GetArtistsPagingAsync(string? keyword, string? status, int pageIndex = 1, int pageSize = 20, CancellationToken cancellationToken = default)
        {
            pageIndex = Math.Max(pageIndex, 1);
            pageSize = Math.Clamp(pageSize, 1, 100);
            return Ok(await _unitOfWork.Artists.GetAllPagingAsync(keyword, status, pageIndex, pageSize, cancellationToken));
        }

        // Số liệu cho các thẻ đầu trang quản lý nghệ sĩ.
        [HttpGet("stats")]
        public async Task<ActionResult<ArtistStatsDto>> GetArtistStatsAsync(CancellationToken cancellationToken)
        {
            return Ok(await _unitOfWork.Artists.GetStatsAsync(cancellationToken));
        }

        // Toàn bộ nghệ sĩ (không phân trang) cho ô chọn nghệ sĩ ở form album / bài hát.
        [HttpGet]
        public async Task<ActionResult<List<ArtistInListDto>>> GetArtistsAsync(CancellationToken cancellationToken)
        {
            return Ok(await _unitOfWork.Artists.GetAllOrderedAsync(cancellationToken));
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ArtistDto>> GetArtistByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            var artist = await _unitOfWork.Artists.GetByIdAsync(id, cancellationToken);
            if (artist == null)
            {
                return NotFound(new[] { "Không tìm thấy nghệ sĩ." });
            }

            return Ok(_mapper.Map<ArtistDto>(artist));
        }

        [HttpPost]
        public async Task<ActionResult<ArtistDto>> CreateArtistAsync([FromBody] CreateUpdateArtistRequest request, CancellationToken cancellationToken)
        {
            Normalize(request);
            if (await _unitOfWork.Artists.IsSlugExistsAsync(request.Slug, cancellationToken: cancellationToken))
            {
                return BadRequest(new[] { "Slug đã được nghệ sĩ khác dùng." });
            }

            var artist = _mapper.Map<Artist>(request);
            _unitOfWork.Artists.Add(artist);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Ok(_mapper.Map<ArtistDto>(artist));
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<ArtistDto>> UpdateArtistAsync(Guid id, [FromBody] CreateUpdateArtistRequest request, CancellationToken cancellationToken)
        {
            var artist = await _unitOfWork.Artists.GetByIdAsync(id, cancellationToken);
            if (artist == null)
            {
                return NotFound(new[] { "Không tìm thấy nghệ sĩ." });
            }

            Normalize(request);
            if (await _unitOfWork.Artists.IsSlugExistsAsync(request.Slug, id, cancellationToken))
            {
                return BadRequest(new[] { "Slug đã được nghệ sĩ khác dùng." });
            }

            // Ghi nhớ ảnh cũ trước khi chép dữ liệu mới vào entity.
            var oldImageUrls = new[] { artist.AvatarUrl, artist.CoverImageUrl };
            _mapper.Map(request, artist);
            await _unitOfWork.CompleteAsync(cancellationToken);

            // Ảnh nào không còn được dùng (đã đổi hoặc bỏ) thì xoá trên R2 để không để lại file rác.
            await _fileStorageService.DeleteUnusedImagesAsync(
                oldImageUrls.Where(url => url != artist.AvatarUrl && url != artist.CoverImageUrl));

            return Ok(_mapper.Map<ArtistDto>(artist));
        }

        // Xoá nhiều nghệ sĩ một lần (?ids=...&ids=...). Chỉ xoá được nghệ sĩ chưa có album / bài hát;
        // nghệ sĩ đã có thì nên tắt IsActive thay vì xoá. Danh sách người theo dõi tự xoá theo (Cascade).
        [HttpDelete]
        public async Task<IActionResult> DeleteArtistsAsync([FromQuery] Guid[] ids, CancellationToken cancellationToken)
        {
            if (ids.Length == 0)
            {
                return BadRequest(new[] { "Chưa chọn nghệ sĩ cần xoá." });
            }

            var artists = new List<Artist>();
            foreach (var id in ids.Distinct())
            {
                var artist = await _unitOfWork.Artists.GetByIdAsync(id, cancellationToken);
                if (artist == null)
                {
                    return NotFound(new[] { "Không tìm thấy nghệ sĩ." });
                }
                if (await _unitOfWork.Artists.HasAlbumsAsync(id, cancellationToken))
                {
                    return BadRequest(new[] { $"Nghệ sĩ \"{artist.Name}\" đang có album nên không xoá được, hãy ẩn nghệ sĩ thay vì xoá." });
                }
                if (await _unitOfWork.Artists.HasSongsAsync(id, cancellationToken))
                {
                    return BadRequest(new[] { $"Nghệ sĩ \"{artist.Name}\" đang có bài hát nên không xoá được, hãy ẩn nghệ sĩ thay vì xoá." });
                }
                artists.Add(artist);
            }

            _unitOfWork.Artists.RemoveRange(artists);
            await _unitOfWork.CompleteAsync(cancellationToken);

            await _fileStorageService.DeleteUnusedImagesAsync(
                artists.SelectMany(x => new[] { x.AvatarUrl, x.CoverImageUrl }));

            return NoContent();
        }

        // Bỏ khoảng trắng thừa; tiểu sử để trống thì lưu null.
        private static void Normalize(CreateUpdateArtistRequest request)
        {
            request.Name = request.Name.Trim();
            request.Bio = string.IsNullOrWhiteSpace(request.Bio) ? null : request.Bio.Trim();
        }
    }
}
