using System.ComponentModel.DataAnnotations;

namespace SoundSpace.Core.Models.UserProfile
{
    // Dữ liệu gửi lên khi sửa hồ sơ. Ảnh đại diện sẽ đổi qua API upload riêng (Firebase).
    public class UpdateProfileRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập họ và tên.")]
        [MaxLength(100, ErrorMessage = "Họ và tên tối đa 100 ký tự.")]
        public required string FullName { get; set; }
    }
}
