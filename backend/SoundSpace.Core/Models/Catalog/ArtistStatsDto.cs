namespace SoundSpace.Core.Models.Catalog
{
    // Số liệu cho 4 thẻ đầu trang "Nghệ sĩ" ở trang quản trị.
    public class ArtistStatsDto
    {
        public int Total { get; set; }
        public int Active { get; set; }
        public int Hidden { get; set; }
        public int Featured { get; set; }
    }
}
