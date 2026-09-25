using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundSpace.Core.Domain.Catalog
{
    [Table("Genres")]
    [Index(nameof(Slug), IsUnique = true)]
    public class Genre
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [Required]
        [Column(TypeName = "varchar(100)")]
        public required string Slug { get; set; }

        /// <summary>Tên icon Material Symbols, ví dụ "headphones", "piano".</summary>
        [MaxLength(50)]
        public string? Icon { get; set; }

        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }

        public int SortOrder { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime DateCreated { get; set; }
        public DateTime? DateModified { get; set; }
    }
}
