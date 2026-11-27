using AutoMapper;
using SoundSpace.Core.Domain.Catalog;

namespace SoundSpace.Core.Models.Catalog
{
    // Đầy đủ thông tin nghệ sĩ, dùng khi mở form sửa (GET theo id) và trả về sau khi thêm / sửa.
    public class ArtistDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Slug { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public string? CoverImageUrl { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsActive { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateModified { get; set; }

        public class AutoMapperProfiles : Profile
        {
            public AutoMapperProfiles()
            {
                CreateMap<Artist, ArtistDto>();
            }
        }
    }
}
