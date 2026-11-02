using Microsoft.EntityFrameworkCore;
using SoundSpace.Core.Domain.Catalog;
using SoundSpace.Core.IRepositories;
using SoundSpace.Data.SeedWorks;

namespace SoundSpace.Data.Repositories
{
    public class SongRepository : RepositoryBase<Song, Guid>, ISongRepository
    {
        public SongRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<string?> GetVisibleAudioFilePathAsync(Guid id)
        {
            // Chỉ lấy đúng cột cần dùng, không tải cả bài hát.
            return await _context.Songs
                .Where(x => x.Id == id && x.IsVisible)
                .Select(x => x.AudioFilePath)
                .FirstOrDefaultAsync();
        }
    }
}
