namespace SoundSpace.Api.Services
{
    public interface IFileStorageService
    {
        // Upload file nhạc vào bucket private, trả về key để lưu vào Song.AudioFilePath.
        Task<string> UploadAudioAsync(Stream content, string fileName, CancellationToken cancellationToken = default);

        // Upload ảnh vào thư mục folder (xem ImageFolders) của bucket ảnh, trả về URL công khai để lưu vào các cột ...Url.
        Task<string> UploadImageAsync(Stream content, string fileName, string folder, CancellationToken cancellationToken = default);

        Task DeleteAudioAsync(string key, CancellationToken cancellationToken = default);

        // Trả về false nếu URL không thuộc bucket ảnh (ví dụ link ảnh bên ngoài) nên không có gì để xoá.
        Task<bool> DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default);
    }
}
