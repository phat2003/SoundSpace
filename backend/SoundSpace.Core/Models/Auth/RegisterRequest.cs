using AutoMapper;
using SoundSpace.Core.Domain.Identity;
using System.ComponentModel.DataAnnotations;

namespace SoundSpace.Core.Models.Auth
{
    // Dữ liệu gửi lên khi người dùng đăng ký tài khoản (form "Tạo tài khoản mới").
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập họ và tên.")]
        [MaxLength(100, ErrorMessage = "Họ và tên tối đa 100 ký tự.")]
        public required string FullName { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập email.")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        [MaxLength(256, ErrorMessage = "Email tối đa 256 ký tự.")]
        public required string Email { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu.")]
        [MinLength(8, ErrorMessage = "Mật khẩu phải có ít nhất 8 ký tự.")]
        public required string Password { get; set; }

        [Required(ErrorMessage = "Vui lòng xác nhận mật khẩu.")]
        [Compare(nameof(Password), ErrorMessage = "Mật khẩu xác nhận không khớp.")]
        public required string ConfirmPassword { get; set; }

        public class AutoMapperProfiles : Profile
        {
            public AutoMapperProfiles()
            {
                // Đăng nhập bằng email nên dùng luôn email làm UserName.
                CreateMap<RegisterRequest, AppUser>()
                    .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email));
            }
        }
    }
}
