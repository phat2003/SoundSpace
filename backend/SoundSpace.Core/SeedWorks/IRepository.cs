using System.Linq.Expressions;

namespace SoundSpace.Core.SeedWorks
{
    // Các thao tác chung cho mọi bảng (theo TeduBlog). Thay đổi chỉ được lưu khi gọi IUnitOfWork.CompleteAsync().
    public interface IRepository<T, Key> where T : class
    {
        Task<T?> GetByIdAsync(Key id);
        Task<IEnumerable<T>> GetAllAsync();
        IEnumerable<T> Find(Expression<Func<T, bool>> expression);
        void Add(T entity);
        void AddRange(IEnumerable<T> entities);
        void Remove(T entity);
        void RemoveRange(IEnumerable<T> entities);
    }
}
