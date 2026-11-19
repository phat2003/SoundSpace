using AutoMapper;
using SoundSpace.Core.Domain.Catalog;
using System.ComponentModel.DataAnnotations;

namespace SoundSpace.Core.Models.Catalog
{
    // Dữ liệu gửi lên khi thêm / sửa thể loại (dùng chung cho cả hai như TeduBlog).
    public class CreateUpdateGenreRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập tên thể loại.")]
        [MaxLength(100, ErrorMessage = "Tên thể loại tối đa 100 ký tự.")]
        public required string Name { get; set; }

        // Slug dùng trên đường dẫn, ví dụ "nhac-tre": chỉ chữ thường không dấu, số và dấu "-".
        [Required(ErrorMessage = "Vui lòng nhập slug.")]
        [MaxLength(100, ErrorMessage = "Slug tối đa 100 ký tự.")]
        [RegularExpression("^[a-z0-9]+(-[a-z0-9]+)*$", ErrorMessage = "Slug chỉ gồm chữ thường không dấu, số và dấu \"-\" (ví dụ: nhac-tre).")]
        public required string Slug { get; set; }

        [MaxLength(50, ErrorMessage = "Tên icon tối đa 50 ký tự.")]
        public string? Icon { get; set; }

        // URL ảnh nhận được sau khi upload qua POST api/admin/media/image?type=genres.
        [MaxLength(500, ErrorMessage = "URL ảnh tối đa 500 ký tự.")]
        [Url(ErrorMessage = "URL ảnh không hợp lệ.")]
        public string? CoverImageUrl { get; set; }

        [Range(0, 9999, ErrorMessage = "Thứ tự hiển thị từ 0 đến 9999.")]
        public int SortOrder { get; set; }

        public bool IsActive { get; set; } = true;

        public class AutoMapperProfiles : Profile
        {
            public AutoMapperProfiles()
            {
                CreateMap<CreateUpdateGenreRequest, Genre>();
            }
        }
    }
}
