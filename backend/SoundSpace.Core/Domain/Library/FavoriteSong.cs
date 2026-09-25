using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundSpace.Core.Domain.Library
{
    /// <summary>Bài hát người dùng đã thả tim.</summary>
    [Table("FavoriteSongs")]
    [PrimaryKey(nameof(UserId), nameof(SongId))]
    [Index(nameof(SongId))]
    public class FavoriteSong
    {
        public Guid UserId { get; set; }
        public Guid SongId { get; set; }
        public DateTime DateCreated { get; set; }
    }
}
