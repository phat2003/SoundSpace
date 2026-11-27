using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SoundSpace.Core.Domain.Catalog;
using SoundSpace.Core.IRepositories;
using SoundSpace.Core.Models;
using SoundSpace.Core.Models.Catalog;
using SoundSpace.Core.SeedWorks.Constants;
using SoundSpace.Data.SeedWorks;

namespace SoundSpace.Data.Repositories
{
    public class ArtistRepository : RepositoryBase<Artist, Guid>, IArtistRepository
    {
        private readonly IMapper _mapper;

        public ArtistRepository(ApplicationDbContext context, IMapper mapper) : base(context)
        {
            _mapper = mapper;
        }

        public async Task<PagedResult<ArtistInListDto>> GetAllPagingAsync(string? keyword, string? status, int pageIndex, int pageSize, CancellationToken cancellationToken = default)
        {
            var query = _context.Artists.AsQueryable();
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(x => EF.Functions.ILike(x.Name, $"%{keyword.Trim()}%"));
            }
            query = status switch
            {
                ArtistFilters.Active => query.Where(x => x.IsActive),
                ArtistFilters.Hidden => query.Where(x => !x.IsActive),
                ArtistFilters.Featured => query.Where(x => x.IsFeatured),
                _ => query
            };

            var totalRow = await query.CountAsync(cancellationToken);

            query = query.OrderByDescending(x => x.DateCreated)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize);

            var results = await _mapper.ProjectTo<ArtistInListDto>(query).ToListAsync(cancellationToken);
            await FillCountsAsync(results, cancellationToken);

            return new PagedResult<ArtistInListDto>
            {
                Results = results,
                CurrentPage = pageIndex,
                RowCount = totalRow,
                PageSize = pageSize
            };
        }

        public async Task<ArtistStatsDto> GetStatsAsync(CancellationToken cancellationToken = default)
        {
            var total = await _context.Artists.CountAsync(cancellationToken);
            var active = await _context.Artists.CountAsync(x => x.IsActive, cancellationToken);
            var featured = await _context.Artists.CountAsync(x => x.IsFeatured, cancellationToken);
            return new ArtistStatsDto { Total = total, Active = active, Hidden = total - active, Featured = featured };
        }

        public async Task<List<ArtistInListDto>> GetAllOrderedAsync(CancellationToken cancellationToken = default)
        {
            var query = _context.Artists.OrderBy(x => x.Name);
            return await _mapper.ProjectTo<ArtistInListDto>(query).ToListAsync(cancellationToken);
        }

        public async Task<bool> IsSlugExistsAsync(string slug, Guid? excludeId = null, CancellationToken cancellationToken = default)
        {
            return await _context.Artists.AnyAsync(x => x.Slug == slug && x.Id != excludeId, cancellationToken);
        }

        public async Task<bool> HasAlbumsAsync(Guid artistId, CancellationToken cancellationToken = default)
        {
            return await _context.Albums.AnyAsync(x => x.ArtistId == artistId, cancellationToken);
        }

        public async Task<bool> HasSongsAsync(Guid artistId, CancellationToken cancellationToken = default)
        {
            return await _context.SongArtists.AnyAsync(x => x.ArtistId == artistId, cancellationToken);
        }

        // Entity không có navigation property nên đếm bằng 2 truy vấn GROUP BY cho các nghệ sĩ trong trang hiện tại.
        private async Task FillCountsAsync(List<ArtistInListDto> artists, CancellationToken cancellationToken)
        {
            if (artists.Count == 0)
            {
                return;
            }

            var ids = artists.Select(x => x.Id).ToList();
            var songCounts = await _context.SongArtists
                .Where(x => ids.Contains(x.ArtistId))
                .GroupBy(x => x.ArtistId)
                .Select(g => new { ArtistId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ArtistId, x => x.Count, cancellationToken);
            var albumCounts = await _context.Albums
                .Where(x => ids.Contains(x.ArtistId))
                .GroupBy(x => x.ArtistId)
                .Select(g => new { ArtistId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ArtistId, x => x.Count, cancellationToken);

            foreach (var artist in artists)
            {
                artist.SongCount = songCounts.GetValueOrDefault(artist.Id);
                artist.AlbumCount = albumCounts.GetValueOrDefault(artist.Id);
            }
        }
    }
}
