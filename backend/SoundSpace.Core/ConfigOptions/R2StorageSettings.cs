namespace SoundSpace.Core.ConfigOptions
{
    // Đọc từ mục "R2StorageSettings" trong appsettings. AccessKeyId / SecretAccessKey là bí mật, không commit.
    public class R2StorageSettings
    {
        // Account ID của Cloudflare, dùng để ghép endpoint https://<AccountId>.r2.cloudflarestorage.com
        public required string AccountId { get; set; }
        public required string AccessKeyId { get; set; }
        public required string SecretAccessKey { get; set; }
        // Bucket private chứa file nhạc, chỉ phát được qua presigned URL do API cấp.
        public required string AudioBucketName { get; set; }
        // Bucket bật Public access chứa ảnh (bìa, avatar, banner...).
        public required string ImageBucketName { get; set; }
        // URL công khai của bucket ảnh (r2.dev hoặc tên miền riêng), ví dụ https://pub-xxxx.r2.dev
        public required string ImagePublicUrl { get; set; }
    }
}
