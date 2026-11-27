using AutoMapper;
using SoundSpace.Core.Domain.Catalog;

namespace SoundSpace.Core.Models.Catalog
{
    // Một dòng trong bảng nghệ sĩ ở trang quản trị: bỏ Bio (dài tới 2000 ký tự) và ảnh bìa cho nhẹ.
    public class ArtistInListDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Slug { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsActive { get; set; }
        // Số bài hát / album của nghệ sĩ (cột "Sản phẩm âm nhạc"). Chỉ API phân trang điền, API lấy tất cả để 0.
        public int SongCount { get; set; }
        public int AlbumCount { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateModified { get; set; }

        public class AutoMapperProfiles : Profile
        {
            public AutoMapperProfiles()
            {
                CreateMap<Artist, ArtistInListDto>()
                    .ForMember(dest => dest.SongCount, opt => opt.Ignore())
                    .ForMember(dest => dest.AlbumCount, opt => opt.Ignore());
            }
        }
    }
}
