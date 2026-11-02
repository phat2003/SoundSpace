using Microsoft.AspNetCore.Mvc;
using SoundSpace.Api.Services;
using SoundSpace.Core.Models.Player;
using SoundSpace.Core.SeedWorks;

namespace SoundSpace.Api.Controllers
{
    // API bài hát cho người nghe. Không gắn [Authorize] vì khách chưa đăng nhập vẫn được nghe (link chia sẻ /song/:id).
    [Route("api/song")]
    [ApiController]
    public class SongController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorageService _fileStorageService;

        public SongController(IUnitOfWork unitOfWork, IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork;
            _fileStorageService = fileStorageService;
        }

        // Cấp link phát nhạc có hạn cho bài đang hiện. File nhạc nằm trong bucket private nên không có link cố định.
        [HttpGet("{id:guid}/stream")]
        public async Task<ActionResult<AudioStreamDto>> GetStreamUrl(Guid id)
        {
            var audioFilePath = await _unitOfWork.Songs.GetVisibleAudioFilePathAsync(id);
            if (audioFilePath == null)
            {
                return NotFound(new[] { "Không tìm thấy bài hát." });
            }

            return Ok(await _fileStorageService.GetAudioUrlAsync(audioFilePath));
        }
    }
}
