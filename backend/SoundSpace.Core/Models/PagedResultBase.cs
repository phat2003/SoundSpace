namespace SoundSpace.Core.Models
{
    // Thông tin phân trang dùng chung cho các danh sách.
    public abstract class PagedResultBase
    {
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int RowCount { get; set; }
        public int PageCount => (int)Math.Ceiling((double)RowCount / PageSize);
    }
}
