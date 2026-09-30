using System.ComponentModel.DataAnnotations;

namespace SoundSpace.Core.Models.Auth
{
    // Dữ liệu gửi lên khi xin access token mới: access token cũ (có thể đã hết hạn) + refresh token.
    public class TokenRequest
    {
        [Required(ErrorMessage = "Thiếu access token.")]
        public required string AccessToken { get; set; }

        [Required(ErrorMessage = "Thiếu refresh token.")]
        public required string RefreshToken { get; set; }
    }
}
