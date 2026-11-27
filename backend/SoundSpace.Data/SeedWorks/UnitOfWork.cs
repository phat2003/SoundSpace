using AutoMapper;
using SoundSpace.Core.IRepositories;
using SoundSpace.Core.SeedWorks;
using SoundSpace.Data.Repositories;

namespace SoundSpace.Data.SeedWorks
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;

        public UnitOfWork(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            Artists = new ArtistRepository(context, mapper);
            Genres = new GenreRepository(context, mapper);
            Songs = new SongRepository(context);
        }

        public IArtistRepository Artists { get; private set; }
        public IGenreRepository Genres { get; private set; }
        public ISongRepository Songs { get; private set; }

        public async Task<int> CompleteAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
