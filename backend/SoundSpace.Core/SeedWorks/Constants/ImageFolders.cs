namespace SoundSpace.Core.SeedWorks.Constants
{
    // Thư mục con trong bucket ảnh, đặt theo nơi dùng ảnh.
    public static class ImageFolders
    {
        public const string Albums = "albums";
        public const string Artists = "artists";
        public const string Avatars = "avatars";
        public const string Banners = "banners";
        public const string Genres = "genres";
        public const string Playlists = "playlists";
        public const string Songs = "songs";

        public static readonly string[] All = [Albums, Artists, Avatars, Banners, Genres, Playlists, Songs];
    }
}
