using SoundSpace.Core.Domain.Catalog;
using SoundSpace.Core.Models;
using SoundSpace.Core.Models.Catalog;
using SoundSpace.Core.SeedWorks;

namespace SoundSpace.Core.IRepositories
{
    public interface IGenreRepository : IRepository<Genre, Guid>
    {
        // Tìm theo tên (không phân biệt hoa thường), sắp theo SortOrder rồi tới tên.
        Task<PagedResult<GenreDto>> GetAllPagingAsync(string? keyword, int pageIndex, int pageSize, CancellationToken cancellationToken = default);

        // Toàn bộ thể loại theo thứ tự hiển thị, dùng cho ô chọn thể loại khi thêm / sửa bài hát.
        Task<List<GenreDto>> GetAllOrderedAsync(CancellationToken cancellationToken = default);

        // Slug đã được thể loại khác dùng chưa (excludeId = thể loại đang sửa, bỏ qua chính nó).
        Task<bool> IsSlugExistsAsync(string slug, Guid? excludeId = null, CancellationToken cancellationToken = default);

        // Còn bài hát thuộc thể loại này không (còn thì không được xoá).
        Task<bool> HasSongsAsync(Guid genreId, CancellationToken cancellationToken = default);
    }
}
