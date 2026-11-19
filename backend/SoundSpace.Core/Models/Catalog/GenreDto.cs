using AutoMapper;
using SoundSpace.Core.Domain.Catalog;

namespace SoundSpace.Core.Models.Catalog
{
    // Thể loại trả về cho trang quản trị.
    public class GenreDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Slug { get; set; }
        public string? Icon { get; set; }
        public string? CoverImageUrl { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateModified { get; set; }

        public class AutoMapperProfiles : Profile
        {
            public AutoMapperProfiles()
            {
                CreateMap<Genre, GenreDto>();
            }
        }
    }
}
