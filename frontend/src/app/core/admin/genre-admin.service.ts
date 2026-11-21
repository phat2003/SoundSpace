import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreateUpdateGenreRequest, Genre } from '../models/genre';
import { PagedResult } from '../models/paged-result';

/** Gọi API CRUD thể loại (api/admin/genre, chỉ Admin gọi được). */
@Service()
export class GenreAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/genre`;

  /** Tìm theo tên, sắp theo thứ tự hiển thị; trang đầu tiên là 1. */
  readonly getGenresPaging = (keyword: string, pageIndex: number, pageSize: number) =>
    this.http.get<PagedResult<Genre>>(`${this.apiUrl}/paging`, {
      params: { keyword, pageIndex, pageSize },
    });

  /** Trả về thể loại vừa tạo. */
  readonly createGenre = (request: CreateUpdateGenreRequest) =>
    this.http.post<Genre>(this.apiUrl, request);

  /** Trả về thể loại sau khi sửa. */
  readonly updateGenre = (id: string, request: CreateUpdateGenreRequest) =>
    this.http.put<Genre>(`${this.apiUrl}/${id}`, request);

  /** API nhận nhiều id (?ids=a&ids=b); thể loại còn bài hát sẽ bị từ chối. */
  readonly deleteGenres = (ids: string[]) =>
    this.http.delete<void>(this.apiUrl, { params: { ids } });
}
