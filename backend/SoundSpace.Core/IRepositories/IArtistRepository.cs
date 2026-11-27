using SoundSpace.Core.Domain.Catalog;
using SoundSpace.Core.Models;
using SoundSpace.Core.Models.Catalog;
using SoundSpace.Core.SeedWorks;

namespace SoundSpace.Core.IRepositories
{
    public interface IArtistRepository : IRepository<Artist, Guid>
    {
        // Tìm theo tên (không phân biệt hoa thường), lọc theo status (xem ArtistFilters), nghệ sĩ mới thêm hiện trước.
        // Mỗi dòng kèm số bài hát / album của nghệ sĩ.
        Task<PagedResult<ArtistInListDto>> GetAllPagingAsync(string? keyword, string? status, int pageIndex, int pageSize, CancellationToken cancellationToken = default);

        // Đếm tổng / đang hiển thị / đang ẩn / nổi bật cho các thẻ số liệu.
        Task<ArtistStatsDto> GetStatsAsync(CancellationToken cancellationToken = default);

        // Toàn bộ nghệ sĩ theo tên A–Z, dùng cho ô chọn nghệ sĩ khi thêm / sửa album, bài hát.
        Task<List<ArtistInListDto>> GetAllOrderedAsync(CancellationToken cancellationToken = default);

        // Slug đã được nghệ sĩ khác dùng chưa (excludeId = nghệ sĩ đang sửa, bỏ qua chính nó).
        Task<bool> IsSlugExistsAsync(string slug, Guid? excludeId = null, CancellationToken cancellationToken = default);

        // Còn album / bài hát của nghệ sĩ này không (còn thì không được xoá).
        Task<bool> HasAlbumsAsync(Guid artistId, CancellationToken cancellationToken = default);
        Task<bool> HasSongsAsync(Guid artistId, CancellationToken cancellationToken = default);
    }
}
