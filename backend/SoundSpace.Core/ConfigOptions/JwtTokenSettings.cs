namespace SoundSpace.Core.ConfigOptions
{
    // Đọc từ mục "JwtTokenSettings" trong appsettings.
    public class JwtTokenSettings
    {
        // Khoá bí mật để ký token (HMAC-SHA256), tối thiểu 32 ký tự. Không commit khoá thật.
        public required string Key { get; set; }
        public required string Issuer { get; set; }
        public int ExpireInHours { get; set; }
        public int RefreshTokenExpireInDays { get; set; }
    }
}
