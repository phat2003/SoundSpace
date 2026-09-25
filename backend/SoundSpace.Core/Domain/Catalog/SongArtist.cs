using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundSpace.Core.Domain.Catalog
{
    /// <summary>Bảng nối: nghệ sĩ trình bày một bài hát (ví dụ "HIEUTHUHAI x W/N").</summary>
    [Table("SongArtists")]
    [PrimaryKey(nameof(SongId), nameof(ArtistId))]
    [Index(nameof(ArtistId))]
    public class SongArtist
    {
        public Guid SongId { get; set; }
        public Guid ArtistId { get; set; }

        /// <summary>0 = nghệ sĩ chính, hiển thị đầu tiên.</summary>
        public int SortOrder { get; set; }
    }
}
