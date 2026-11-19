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
    // CRUD thể loại cho trang quản trị (theo PostCategoryController của TeduBlog).
    [Route("api/admin/genre")]
    [ApiController]
    [Authorize(Roles = Roles.Admin)]
    public class GenreController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly ILogger<GenreController> _logger;

        public GenreController(IUnitOfWork unitOfWork,
            IMapper mapper,
            IFileStorageService fileStorageService,
            ILogger<GenreController> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
            _logger = logger;
        }

        [HttpGet("paging")]
        public async Task<ActionResult<PagedResult<GenreDto>>> GetGenresPagingAsync(string? keyword, int pageIndex = 1, int pageSize = 20, CancellationToken cancellationToken = default)
        {
            pageIndex = Math.Max(pageIndex, 1);
            pageSize = Math.Clamp(pageSize, 1, 100);
            return Ok(await _unitOfWork.Genres.GetAllPagingAsync(keyword, pageIndex, pageSize, cancellationToken));
        }

        // Toàn bộ thể loại (không phân trang) cho ô chọn thể loại ở form bài hát.
        [HttpGet]
        public async Task<ActionResult<List<GenreDto>>> GetGenresAsync(CancellationToken cancellationToken)
        {
            return Ok(await _unitOfWork.Genres.GetAllOrderedAsync(cancellationToken));
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<GenreDto>> GetGenreByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            var genre = await _unitOfWork.Genres.GetByIdAsync(id, cancellationToken);
            if (genre == null)
            {
                return NotFound(new[] { "Không tìm thấy thể loại." });
            }

            return Ok(_mapper.Map<GenreDto>(genre));
        }

        [HttpPost]
        public async Task<ActionResult<GenreDto>> CreateGenreAsync([FromBody] CreateUpdateGenreRequest request, CancellationToken cancellationToken)
        {
            request.Name = request.Name.Trim();
            if (await _unitOfWork.Genres.IsSlugExistsAsync(request.Slug, cancellationToken: cancellationToken))
            {
                return BadRequest(new[] { "Slug đã được thể loại khác dùng." });
            }

            var genre = _mapper.Map<Genre>(request);
            _unitOfWork.Genres.Add(genre);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Ok(_mapper.Map<GenreDto>(genre));
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<GenreDto>> UpdateGenreAsync(Guid id, [FromBody] CreateUpdateGenreRequest request, CancellationToken cancellationToken)
        {
            var genre = await _unitOfWork.Genres.GetByIdAsync(id, cancellationToken);
            if (genre == null)
            {
                return NotFound(new[] { "Không tìm thấy thể loại." });
            }

            request.Name = request.Name.Trim();
            if (await _unitOfWork.Genres.IsSlugExistsAsync(request.Slug, id, cancellationToken))
            {
                return BadRequest(new[] { "Slug đã được thể loại khác dùng." });
            }

            var oldCoverImageUrl = genre.CoverImageUrl;
            _mapper.Map(request, genre);
            await _unitOfWork.CompleteAsync(cancellationToken);

            // Đổi / bỏ ảnh bìa thì xoá ảnh cũ trên R2 để không để lại file rác.
            if (oldCoverImageUrl != null && oldCoverImageUrl != genre.CoverImageUrl)
            {
                await TryDeleteImageAsync(oldCoverImageUrl);
            }

            return Ok(_mapper.Map<GenreDto>(genre));
        }

        // Xoá nhiều thể loại một lần (?ids=...&ids=...). Chỉ xoá được thể loại chưa có bài hát;
        // thể loại đã có bài hát thì nên tắt IsActive thay vì xoá.
        [HttpDelete]
        public async Task<IActionResult> DeleteGenresAsync([FromQuery] Guid[] ids, CancellationToken cancellationToken)
        {
            if (ids.Length == 0)
            {
                return BadRequest(new[] { "Chưa chọn thể loại cần xoá." });
            }

            var genres = new List<Genre>();
            foreach (var id in ids.Distinct())
            {
                var genre = await _unitOfWork.Genres.GetByIdAsync(id, cancellationToken);
                if (genre == null)
                {
                    return NotFound(new[] { "Không tìm thấy thể loại." });
                }
                if (await _unitOfWork.Genres.HasSongsAsync(id, cancellationToken))
                {
                    return BadRequest(new[] { $"Thể loại \"{genre.Name}\" đang có bài hát nên không xoá được, hãy ẩn thể loại thay vì xoá." });
                }
                genres.Add(genre);
            }

            _unitOfWork.Genres.RemoveRange(genres);
            await _unitOfWork.CompleteAsync(cancellationToken);

            foreach (var coverImageUrl in genres.Select(x => x.CoverImageUrl).OfType<string>())
            {
                await TryDeleteImageAsync(coverImageUrl);
            }

            return NoContent();
        }

        // Database đã lưu xong nên xoá ảnh lỗi chỉ ghi log, không báo lỗi cho admin
        // (ảnh không thuộc bucket của SoundSpace thì DeleteImageAsync tự bỏ qua).
        private async Task TryDeleteImageAsync(string imageUrl)
        {
            try
            {
                await _fileStorageService.DeleteImageAsync(imageUrl, CancellationToken.None);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Không xoá được ảnh thể loại {ImageUrl}", imageUrl);
            }
        }
    }
}
