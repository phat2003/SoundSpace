using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundSpace.Core.Domain.Library
{
    /// <summary>Nghệ sĩ người dùng đang theo dõi.</summary>
    [Table("FollowedArtists")]
    [PrimaryKey(nameof(UserId), nameof(ArtistId))]
    [Index(nameof(ArtistId))]
    public class FollowedArtist
    {
        public Guid UserId { get; set; }
        public Guid ArtistId { get; set; }
        public DateTime DateCreated { get; set; }
    }
}
