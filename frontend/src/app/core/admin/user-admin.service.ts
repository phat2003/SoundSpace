import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../models/paged-result';
import { UserInList } from '../models/user-management';

/** Gọi API quản lý người dùng (api/admin/user, chỉ Admin gọi được). */
@Service()
export class UserAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/user`;

  /** Tìm theo họ tên / email (không phân biệt hoa thường), trang đầu tiên là 1. */
  readonly getUsersPaging = (keyword: string, pageIndex: number, pageSize: number) =>
    this.http.get<PagedResult<UserInList>>(`${this.apiUrl}/paging`, {
      params: { keyword, pageIndex, pageSize },
    });
}
