using SoundSpace.Core.IRepositories;

namespace SoundSpace.Core.SeedWorks
{
    // Gom các repository dùng chung một DbContext; CompleteAsync lưu mọi thay đổi trong một lần.
    public interface IUnitOfWork
    {
        IGenreRepository Genres { get; }
        ISongRepository Songs { get; }

        Task<int> CompleteAsync(CancellationToken cancellationToken = default);
    }
}
