using SoundSpace.Core.Domain.Catalog;
using SoundSpace.Core.SeedWorks;

namespace SoundSpace.Core.IRepositories
{
    public interface ISongRepository : IRepository<Song, Guid>
    {
        // Key file nhạc trên R2 của bài đang hiện (IsVisible); null nếu không có bài hoặc bài đã bị ẩn.
        Task<string?> GetVisibleAudioFilePathAsync(Guid id);
    }
}
