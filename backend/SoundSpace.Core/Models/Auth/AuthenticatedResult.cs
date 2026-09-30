namespace SoundSpace.Core.Models.Auth
{
    // Kết quả trả về khi đăng nhập thành công.
    public class AuthenticatedResult
    {
        public required string Token { get; set; }
        public required string RefreshToken { get; set; }
    }
}
