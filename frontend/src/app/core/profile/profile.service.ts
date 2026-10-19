import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Profile, UpdateProfileRequest } from '../models/profile';

/** Gọi API hồ sơ của người đang đăng nhập (token do interceptor tự gắn). */
@Service()
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/profile`;

  readonly getProfile = () => this.http.get<Profile>(this.apiUrl);

  /** Trả về hồ sơ sau khi sửa. */
  readonly updateProfile = (request: UpdateProfileRequest) =>
    this.http.put<Profile>(this.apiUrl, request);
}
