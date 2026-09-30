using System.ComponentModel.DataAnnotations;

namespace SoundSpace.Core.Models.Auth
{
    // Dữ liệu gửi lên khi đăng nhập. Người dùng đăng nhập bằng email.
    public class LoginRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập email.")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public required string Email { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu.")]
        public required string Password { get; set; }
    }
}
