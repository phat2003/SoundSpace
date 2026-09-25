using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundSpace.Core.Domain.Library
{
    [Table("Playlists")]
    [Index(nameof(UserId))]
    public class Playlist
    {
        [Key]
        public Guid Id { get; set; }

        /// <summary>Người tạo playlist (với playlist hệ thống là admin).</summary>
        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(250)]
        public required string Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }

        /// <summary>
        /// true = playlist do admin tạo để giới thiệu ở trang chủ (Chill Hits, Deep Focus...).
        /// </summary>
        public bool IsSystem { get; set; }

        public DateTime DateCreated { get; set; }
        public DateTime? DateModified { get; set; }
    }
}
