// Khớp với PagedResult<T> trong backend/SoundSpace.Core/Models: một trang dữ liệu kèm thông tin phân trang.
export interface PagedResult<T> {
  results: T[];
  currentPage: number;
  pageSize: number;
  rowCount: number;
  pageCount: number;
}
