import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Artist,
  ArtistFilter,
  ArtistInList,
  ArtistStats,
  CreateUpdateArtistRequest,
} from '../models/artist';
import { PagedResult } from '../models/paged-result';

/** Gọi API CRUD nghệ sĩ (api/admin/artist, chỉ Admin gọi được). */
@Service()
export class ArtistAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/artist`;

  /** Tìm theo tên, lọc theo trạng thái, nghệ sĩ mới nhất trước; trang đầu tiên là 1. */
  readonly getArtistsPaging = (
    keyword: string,
    status: ArtistFilter,
    pageIndex: number,
    pageSize: number,
  ) =>
    this.http.get<PagedResult<ArtistInList>>(`${this.apiUrl}/paging`, {
      params: { keyword, status, pageIndex, pageSize },
    });

  readonly getStats = () => this.http.get<ArtistStats>(`${this.apiUrl}/stats`);

  readonly getArtist = (id: string) => this.http.get<Artist>(`${this.apiUrl}/${id}`);

  /** Trả về nghệ sĩ vừa tạo. */
  readonly createArtist = (request: CreateUpdateArtistRequest) =>
    this.http.post<Artist>(this.apiUrl, request);

  /** Trả về nghệ sĩ sau khi sửa (API tự xoá ảnh cũ trên R2 nếu đổi ảnh). */
  readonly updateArtist = (id: string, request: CreateUpdateArtistRequest) =>
    this.http.put<Artist>(`${this.apiUrl}/${id}`, request);

  /** API nhận nhiều id (?ids=a&ids=b); nghệ sĩ còn album / bài hát sẽ bị từ chối. */
  readonly deleteArtists = (ids: string[]) =>
    this.http.delete<void>(this.apiUrl, { params: { ids } });
}
