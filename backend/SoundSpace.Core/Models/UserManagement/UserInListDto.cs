using AutoMapper;
using SoundSpace.Core.Domain.Identity;

namespace SoundSpace.Core.Models.UserManagement
{
    // Một dòng trong bảng danh sách người dùng ở trang quản trị.
    public class UserInListDto
    {
        public Guid Id { get; set; }
        public required string FullName { get; set; }
        public string? Email { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsActive { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public DateTime DateCreated { get; set; }

        public class AutoMapperProfiles : Profile
        {
            public AutoMapperProfiles()
            {
                CreateMap<AppUser, UserInListDto>();
            }
        }
    }
}
