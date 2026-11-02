namespace SoundSpace.Core.Models.Player
{
    // Link phát nhạc tạm thời (presigned URL của R2). Hết hạn thì player gọi API để lấy link mới.
    public class AudioStreamDto
    {
        public required string Url { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
