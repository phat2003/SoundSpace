using System.ComponentModel.DataAnnotations;

namespace SoundSpace.Core.Models.UserProfile
{
    // Dữ liệu gửi lên khi người dùng tự đổi mật khẩu.
    public class ChangePasswordRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập mật khẩu hiện tại.")]
        public required string CurrentPassword { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới.")]
        [MinLength(8, ErrorMessage = "Mật khẩu mới phải có ít nhất 8 ký tự.")]
        public required string NewPassword { get; set; }

        [Required(ErrorMessage = "Vui lòng xác nhận mật khẩu mới.")]
        [Compare(nameof(NewPassword), ErrorMessage = "Mật khẩu xác nhận không khớp.")]
        public required string ConfirmPassword { get; set; }
    }
}
