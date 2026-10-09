namespace SoundSpace.Core.Models
{
    // Một trang dữ liệu kèm thông tin phân trang.
    public class PagedResult<T> : PagedResultBase where T : class
    {
        public List<T> Results { get; set; } = [];
    }
}
