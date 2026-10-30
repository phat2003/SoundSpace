using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Options;
using SoundSpace.Core.ConfigOptions;

namespace SoundSpace.Api.Services
{
    // Lưu file trên Cloudflare R2. R2 tương thích S3 nên dùng thư viện AWSSDK.S3 (IAmazonS3 đăng ký trong Program.cs).
    public class R2FileStorageService : IFileStorageService
    {
        private const string AudioFolder = "songs";
        private static readonly FileExtensionContentTypeProvider ContentTypeProvider = new();

        private readonly IAmazonS3 _s3Client;
        private readonly R2StorageSettings _settings;

        public R2FileStorageService(IAmazonS3 s3Client, IOptions<R2StorageSettings> settings)
        {
            _s3Client = s3Client;
            _settings = settings.Value;
        }

        public Task<string> UploadAudioAsync(Stream content, string fileName, CancellationToken cancellationToken = default)
        {
            return UploadAsync(_settings.AudioBucketName, AudioFolder, content, fileName, cancellationToken);
        }

        public async Task<string> UploadImageAsync(Stream content, string fileName, string folder, CancellationToken cancellationToken = default)
        {
            var key = await UploadAsync(_settings.ImageBucketName, folder, content, fileName, cancellationToken);
            return ImageUrlPrefix + key;
        }

        public async Task DeleteAudioAsync(string key, CancellationToken cancellationToken = default)
        {
            // R2 vẫn báo thành công nếu key không tồn tại.
            await _s3Client.DeleteObjectAsync(_settings.AudioBucketName, key, cancellationToken);
        }

        public async Task<bool> DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default)
        {
            if (!imageUrl.StartsWith(ImageUrlPrefix, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            await _s3Client.DeleteObjectAsync(_settings.ImageBucketName, imageUrl[ImageUrlPrefix.Length..], cancellationToken);
            return true;
        }

        private string ImageUrlPrefix => _settings.ImagePublicUrl.TrimEnd('/') + "/";

        // Đặt tên mới dạng <thư mục>/<yyyyMM>/<guid>.<đuôi> để không trùng và không lộ tên file gốc.
        private async Task<string> UploadAsync(string bucketName, string folder, Stream content, string fileName, CancellationToken cancellationToken)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            var key = $"{folder}/{DateTime.UtcNow:yyyyMM}/{Guid.NewGuid():N}{extension}";
            if (!ContentTypeProvider.TryGetContentType(extension, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            await _s3Client.PutObjectAsync(new PutObjectRequest
            {
                BucketName = bucketName,
                Key = key,
                InputStream = content,
                ContentType = contentType,
                // R2 chưa hỗ trợ kiểu ký streaming SigV4 và checksum mặc định của AWSSDK nên phải tắt (theo tài liệu Cloudflare).
                DisablePayloadSigning = true,
                DisableDefaultChecksumValidation = true
            }, cancellationToken);

            return key;
        }
    }
}
