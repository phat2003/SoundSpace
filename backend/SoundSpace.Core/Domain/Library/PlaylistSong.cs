using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundSpace.Core.Domain.Library
{
    /// <summary>
    /// Bài hát trong playlist. Khoá chính (PlaylistId, SongId) đảm bảo một bài
    /// không bị thêm trùng vào cùng một playlist.
    /// </summary>
    [Table("PlaylistSongs")]
    [PrimaryKey(nameof(PlaylistId), nameof(SongId))]
    [Index(nameof(SongId))]
    public class PlaylistSong
    {
        public Guid PlaylistId { get; set; }
        public Guid SongId { get; set; }

        /// <summary>Thứ tự bài trong playlist, bắt đầu từ 0.</summary>
        public int Position { get; set; }

        public DateTime DateAdded { get; set; }
    }
}
