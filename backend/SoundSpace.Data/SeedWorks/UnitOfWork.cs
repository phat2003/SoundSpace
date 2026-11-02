using SoundSpace.Core.IRepositories;
using SoundSpace.Core.SeedWorks;
using SoundSpace.Data.Repositories;

namespace SoundSpace.Data.SeedWorks
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            Songs = new SongRepository(context);
        }

        public ISongRepository Songs { get; private set; }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
