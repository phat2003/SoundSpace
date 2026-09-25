using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundSpace.Core.Domain.Catalog
{
    /// <summary>
    /// Bài hát. Nghệ sĩ trình bày nằm ở bảng nối SongArtists (một bài có thể nhiều nghệ sĩ).
    /// </summary>
    [Table("Songs")]
    [Index(nameof(Slug), IsUnique = true)]
    [Index(nameof(AlbumId))]
    [Index(nameof(GenreId))]
    [Index(nameof(PlayCount))]
    public class Song
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(250)]
        public required string Title { get; set; }

        [Required]
        [Column(TypeName = "varchar(250)")]
        public required string Slug { get; set; }

        /// <summary>Null = single không thuộc album nào.</summary>
        public Guid? AlbumId { get; set; }

        /// <summary>Thứ tự bài trong album.</summary>
        public int? TrackNumber { get; set; }

        [Required]
        public Guid GenreId { get; set; }

        /// <summary>
        /// Đường dẫn file MP3 trong Firebase Storage (không phải URL công khai).
        /// API sẽ cấp signed URL có thời hạn mỗi lần phát.
        /// </summary>
        [Required]
        [MaxLength(500)]
        public required string AudioFilePath { get; set; }

        /// <summary>Dung lượng file (byte), dùng để kiểm tra giới hạn upload.</summary>
        public long AudioFileSize { get; set; }

        /// <summary>Null = dùng ảnh bìa của album.</summary>
        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }

        public int DurationSeconds { get; set; }

        public string? Lyrics { get; set; }

        /// <summary>Tổng lượt nghe hợp lệ (nghe ≥ 30 giây). Dùng để xếp Top bài hát.</summary>
        public long PlayCount { get; set; }

        /// <summary>false = admin ẩn bài, người nghe không thấy.</summary>
        public bool IsVisible { get; set; } = true;

        public DateTime? ReleaseDate { get; set; }

        /// <summary>Admin đã tải bài lên.</summary>
        public Guid? CreatedBy { get; set; }

        public DateTime DateCreated { get; set; }
        public DateTime? DateModified { get; set; }
    }
}
