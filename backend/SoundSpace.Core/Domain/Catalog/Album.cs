using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundSpace.Core.Domain.Catalog
{
    [Table("Albums")]
    [Index(nameof(Slug), IsUnique = true)]
    [Index(nameof(ArtistId))]
    public class Album
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(250)]
        public required string Title { get; set; }

        [Required]
        [Column(TypeName = "varchar(250)")]
        public required string Slug { get; set; }

        /// <summary>Nghệ sĩ chính của album.</summary>
        [Required]
        public Guid ArtistId { get; set; }

        public AlbumType Type { get; set; } = AlbumType.Album;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }

        public DateTime? ReleaseDate { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime DateCreated { get; set; }
        public DateTime? DateModified { get; set; }
    }

    public enum AlbumType
    {
        Single = 0,
        EP = 1,
        Album = 2
    }
}
