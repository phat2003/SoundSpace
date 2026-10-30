using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SoundSpace.Api.Services;
using SoundSpace.Core.ConfigOptions;
using SoundSpace.Core.SeedWorks.Constants;

namespace SoundSpace.Api.Controllers.AdminApi
{
    // Upload / xoá file trên Cloudflare R2 (giống MediaController của TeduBlog):
    // trang quản trị upload file trước, nhận key / URL rồi mới gửi kèm khi lưu bài hát, album...
    [Route("api/admin/media")]
    [ApiController]
    [Authorize(Roles = Roles.Admin)]
    public class MediaController : ControllerBase
    {
        private readonly IFileStorageService _fileStorageService;
        private readonly MediaSettings _settings;

        public MediaController(IFileStorageService fileStorageService, IOptions<MediaSettings> settings)
        {
            _fileStorageService = fileStorageService;
            _settings = settings.Value;
        }

        // Trả về key của file trong bucket nhạc, dùng làm AudioFilePath khi tạo bài hát.
        [HttpPost("audio")]
        public async Task<IActionResult> UploadAudio(IFormFile file, CancellationToken cancellationToken)
        {
            var error = ValidateFile(file, _settings.AllowAudioFileTypes, _settings.MaxAudioSizeInMB);
            if (error != null)
            {
                return BadRequest(new[] { error });
            }

            await using var stream = file.OpenReadStream();
            var key = await _fileStorageService.UploadAudioAsync(stream, file.FileName, cancellationToken);
            return Ok(new { key });
        }

        // type là thư mục ảnh: albums, artists, avatars, banners, genres, playlists, songs. Trả về URL công khai của ảnh.
        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] string type, CancellationToken cancellationToken)
        {
            if (!ImageFolders.All.Contains(type))
            {
                return BadRequest(new[] { $"Loại ảnh không hợp lệ, chỉ nhận: {string.Join(", ", ImageFolders.All)}." });
            }

            var error = ValidateFile(file, _settings.AllowImageFileTypes, _settings.MaxImageSizeInMB);
            if (error != null)
            {
                return BadRequest(new[] { error });
            }

            await using var stream = file.OpenReadStream();
            var url = await _fileStorageService.UploadImageAsync(stream, file.FileName, type, cancellationToken);
            return Ok(new { url });
        }

        [HttpDelete("audio")]
        public async Task<IActionResult> DeleteAudio([FromQuery] string key, CancellationToken cancellationToken)
        {
            await _fileStorageService.DeleteAudioAsync(key, cancellationToken);
            return NoContent();
        }

        [HttpDelete("image")]
        public async Task<IActionResult> DeleteImage([FromQuery] string url, CancellationToken cancellationToken)
        {
            if (!await _fileStorageService.DeleteImageAsync(url, cancellationToken))
            {
                return BadRequest(new[] { "URL không thuộc bucket ảnh của SoundSpace." });
            }

            return NoContent();
        }

        // Kiểm tra đuôi file và dung lượng, trả về thông báo lỗi hoặc null nếu hợp lệ.
        private static string? ValidateFile(IFormFile file, string allowFileTypes, int maxSizeInMB)
        {
            var allowedExtensions = allowFileTypes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (!allowedExtensions.Contains(Path.GetExtension(file.FileName).ToLowerInvariant()))
            {
                return $"Chỉ nhận file {string.Join(", ", allowedExtensions)}.";
            }

            if (file.Length == 0)
            {
                return "File rỗng.";
            }

            if (file.Length > maxSizeInMB * 1024L * 1024L)
            {
                return $"File tối đa {maxSizeInMB} MB.";
            }

            return null;
        }
    }
}
