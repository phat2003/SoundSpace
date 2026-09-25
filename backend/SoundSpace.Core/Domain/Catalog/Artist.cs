using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundSpace.Core.Domain.Catalog
{
    [Table("Artists")]
    [Index(nameof(Slug), IsUnique = true)]
    public class Artist
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(250)]
        public required string Name { get; set; }

        [Required]
        [Column(TypeName = "varchar(250)")]
        public required string Slug { get; set; }

        [MaxLength(2000)]
        public string? Bio { get; set; }

        [MaxLength(500)]
        public string? AvatarUrl { get; set; }

        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }

        /// <summary>Hiện trong mục "Nghệ sĩ nổi bật" ở trang chủ.</summary>
        public bool IsFeatured { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime DateCreated { get; set; }
        public DateTime? DateModified { get; set; }
    }
}
