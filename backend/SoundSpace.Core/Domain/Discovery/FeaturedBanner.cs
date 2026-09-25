using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundSpace.Core.Domain.Discovery
{
    /// <summary>Banner nổi bật ở đầu trang Khám phá, do admin chọn.</summary>
    [Table("FeaturedBanners")]
    [Index(nameof(IsActive), nameof(SortOrder))]
    public class FeaturedBanner
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(250)]
        public required string Title { get; set; }

        [MaxLength(500)]
        public string? Subtitle { get; set; }

        /// <summary>Chữ nhỏ phía trên tiêu đề, ví dụ "Độc quyền trên SoundSpace".</summary>
        [MaxLength(100)]
        public string? Tagline { get; set; }

        [Required]
        [MaxLength(500)]
        public required string ImageUrl { get; set; }

        /// <summary>Nút "Phát ngay" sẽ phát / mở nội dung này.</summary>
        public BannerTargetType TargetType { get; set; }
        public Guid TargetId { get; set; }

        public int SortOrder { get; set; }
        public bool IsActive { get; set; } = true;

        /// <summary>Khoảng thời gian hiển thị; null = không giới hạn.</summary>
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public DateTime DateCreated { get; set; }
        public DateTime? DateModified { get; set; }
    }

    public enum BannerTargetType
    {
        Song = 0,
        Album = 1,
        Artist = 2,
        Playlist = 3
    }
}
