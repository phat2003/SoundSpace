namespace SoundSpace.Core.ConfigOptions
{
    // Đọc từ mục "MediaSettings" trong appsettings: loại file và dung lượng được phép upload.
    public class MediaSettings
    {
        // Danh sách đuôi file, cách nhau bằng dấu ",", ví dụ ".mp3"
        public required string AllowAudioFileTypes { get; set; }
        public required string AllowImageFileTypes { get; set; }
        public int MaxAudioSizeInMB { get; set; }
        public int MaxImageSizeInMB { get; set; }
    }
}
