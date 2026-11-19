using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SoundSpace.Core.Domain.Catalog;
using SoundSpace.Core.IRepositories;
using SoundSpace.Core.Models;
using SoundSpace.Core.Models.Catalog;
using SoundSpace.Data.SeedWorks;

namespace SoundSpace.Data.Repositories
{
    public class GenreRepository : RepositoryBase<Genre, Guid>, IGenreRepository
    {
        private readonly IMapper _mapper;

        public GenreRepository(ApplicationDbContext context, IMapper mapper) : base(context)
        {
            _mapper = mapper;
        }

        public async Task<PagedResult<GenreDto>> GetAllPagingAsync(string? keyword, int pageIndex, int pageSize, CancellationToken cancellationToken = default)
        {
            var query = _context.Genres.AsQueryable();
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(x => EF.Functions.ILike(x.Name, $"%{keyword.Trim()}%"));
            }

            var totalRow = await query.CountAsync(cancellationToken);

            query = query.OrderBy(x => x.SortOrder).ThenBy(x => x.Name)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize);

            return new PagedResult<GenreDto>
            {
                Results = await _mapper.ProjectTo<GenreDto>(query).ToListAsync(cancellationToken),
                CurrentPage = pageIndex,
                RowCount = totalRow,
                PageSize = pageSize
            };
        }

        public async Task<List<GenreDto>> GetAllOrderedAsync(CancellationToken cancellationToken = default)
        {
            var query = _context.Genres.OrderBy(x => x.SortOrder).ThenBy(x => x.Name);
            return await _mapper.ProjectTo<GenreDto>(query).ToListAsync(cancellationToken);
        }

        public async Task<bool> IsSlugExistsAsync(string slug, Guid? excludeId = null, CancellationToken cancellationToken = default)
        {
            return await _context.Genres.AnyAsync(x => x.Slug == slug && x.Id != excludeId, cancellationToken);
        }

        public async Task<bool> HasSongsAsync(Guid genreId, CancellationToken cancellationToken = default)
        {
            return await _context.Songs.AnyAsync(x => x.GenreId == genreId, cancellationToken);
        }
    }
}
