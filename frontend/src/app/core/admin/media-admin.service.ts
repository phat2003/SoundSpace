import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Thư mục ảnh trong bucket R2, khớp với ImageFolders của backend. */
export type ImageFolder = 'albums' | 'artists' | 'banners' | 'genres' | 'songs';

/** Upload / xoá file trên Cloudflare R2 qua api/admin/media (chỉ Admin gọi được). */
@Service()
export class MediaAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/media`;

  /** Gửi ảnh dạng multipart (tên trường "file"), trả về URL công khai của ảnh. */
  readonly uploadImage = (file: File, type: ImageFolder) => {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/image`, body, { params: { type } });
  };

  readonly deleteImage = (url: string) =>
    this.http.delete<void>(`${this.apiUrl}/image`, { params: { url } });
}
