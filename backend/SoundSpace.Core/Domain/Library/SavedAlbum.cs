using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundSpace.Core.Domain.Library
{
    /// <summary>Album người dùng đã lưu vào thư viện.</summary>
    [Table("SavedAlbums")]
    [PrimaryKey(nameof(UserId), nameof(AlbumId))]
    [Index(nameof(AlbumId))]
    public class SavedAlbum
    {
        public Guid UserId { get; set; }
        public Guid AlbumId { get; set; }
        public DateTime DateCreated { get; set; }
    }
}
