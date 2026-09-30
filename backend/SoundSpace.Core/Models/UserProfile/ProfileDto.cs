using AutoMapper;
using SoundSpace.Core.Domain.Identity;

namespace SoundSpace.Core.Models.UserProfile
{
    // Thông tin hồ sơ trả về cho người dùng đang đăng nhập (không có PasswordHash, RefreshToken...).
    public class ProfileDto
    {
        public Guid Id { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public string? AvatarUrl { get; set; }
        public IList<string> Roles { get; set; } = [];
        public DateTime DateCreated { get; set; }

        public class AutoMapperProfiles : Profile
        {
            public AutoMapperProfiles()
            {
                // Roles không nằm trong AppUser, controller tự gán sau khi map.
                CreateMap<AppUser, ProfileDto>()
                    .ForMember(dest => dest.Roles, opt => opt.Ignore());
            }
        }
    }
}
