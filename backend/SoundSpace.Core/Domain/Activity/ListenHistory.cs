using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundSpace.Core.Domain.Activity
{
    /// <summary>
    /// Một lượt nghe hợp lệ (nghe ≥ 30 giây).
    /// Dùng cho mục "Nghe gần đây" của người dùng và số liệu "lượt phát hôm nay" trên dashboard.
    /// </summary>
    [Table("ListenHistories")]
    [Index(nameof(UserId), nameof(ListenedAt))]
    [Index(nameof(SongId))]
    [Index(nameof(ListenedAt))]
    public class ListenHistory
    {
        [Key]
        public Guid Id { get; set; }

        /// <summary>Null = khách chưa đăng nhập (vẫn tính vào lượt phát, không có lịch sử cá nhân).</summary>
        public Guid? UserId { get; set; }

        public Guid SongId { get; set; }

        public DateTime ListenedAt { get; set; }
    }
}
