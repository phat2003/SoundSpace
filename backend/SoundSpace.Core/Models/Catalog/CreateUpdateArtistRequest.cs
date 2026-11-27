using AutoMapper;
using SoundSpace.Core.Domain.Catalog;
using System.ComponentModel.DataAnnotations;

namespace SoundSpace.Core.Models.Catalog
{
    // Dữ liệu gửi lên khi thêm / sửa nghệ sĩ (dùng chung cho cả hai như TeduBlog).
    public class CreateUpdateArtistRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập tên nghệ sĩ.")]
        [MaxLength(250, ErrorMessage = "Tên nghệ sĩ tối đa 250 ký tự.")]
        public required string Name { get; set; }

        // Slug dùng trên đường dẫn, ví dụ "son-tung-mtp": chỉ chữ thường không dấu, số và dấu "-".
        [Required(ErrorMessage = "Vui lòng nhập slug.")]
        [MaxLength(250, ErrorMessage = "Slug tối đa 250 ký tự.")]
        [RegularExpression("^[a-z0-9]+(-[a-z0-9]+)*$", ErrorMessage = "Slug chỉ gồm chữ thường không dấu, số và dấu \"-\" (ví dụ: son-tung-mtp).")]
        public required string Slug { get; set; }

        [MaxLength(2000, ErrorMessage = "Tiểu sử tối đa 2000 ký tự.")]
        public string? Bio { get; set; }

        // URL ảnh nhận được sau khi upload qua POST api/admin/media/image?type=artists.
        [MaxLength(500, ErrorMessage = "URL ảnh đại diện tối đa 500 ký tự.")]
        [Url(ErrorMessage = "URL ảnh đại diện không hợp lệ.")]
        public string? AvatarUrl { get; set; }

        [MaxLength(500, ErrorMessage = "URL ảnh bìa tối đa 500 ký tự.")]
        [Url(ErrorMessage = "URL ảnh bìa không hợp lệ.")]
        public string? CoverImageUrl { get; set; }

        // Hiện trong mục "Nghệ sĩ nổi bật" ở trang Khám phá.
        public bool IsFeatured { get; set; }

        public bool IsActive { get; set; } = true;

        public class AutoMapperProfiles : Profile
        {
            public AutoMapperProfiles()
            {
                CreateMap<CreateUpdateArtistRequest, Artist>();
            }
        }
    }
}
