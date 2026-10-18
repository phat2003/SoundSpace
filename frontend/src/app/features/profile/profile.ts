import { DatePipe, formatDate } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ADMIN_ROLE } from '../../core/auth/auth.service';
import { getApiErrors } from '../../core/http/api-error';
import { ProfileService } from '../../core/profile/profile.service';
import { formatDuration } from '../../shared/utils/format-duration';
import { ArtistList } from './artist-list';
import { PlaylistGrid } from './playlist-grid';
import {
  MOCK_FOLLOWED_ARTISTS,
  MOCK_LIKED_SONGS,
  MOCK_PLAYLISTS,
  MOCK_RECENT_LISTENS,
} from './profile-mock';
import { SongList, SongRow } from './song-list';

/**
 * Trang hồ sơ của người đang đăng nhập, theo mẫu Stitch "Hồ sơ".
 * Phần đầu trang lấy từ GET /api/profile; số liệu và các tab (playlist, bài đã thích, nghệ sĩ
 * theo dõi, nghe gần đây) tạm dùng dữ liệu mẫu trong profile-mock.ts cho tới khi có API thư viện.
 * Followers/Following, ảnh bìa, tiểu sử, chia sẻ hồ sơ, tab Thống kê nằm ngoài MVP.
 */
@Component({
  selector: 'app-profile',
  imports: [ArtistList, DatePipe, PlaylistGrid, RouterLink, SongList],
  host: { class: 'block pb-space-xl' },
  template: `
    <!-- Dải nền thay cho ảnh bìa của mẫu (ảnh bìa nằm ngoài MVP) -->
    <div class="relative h-48 w-full overflow-hidden bg-surface-container-low sm:h-56">
      <div
        class="absolute inset-0 bg-linear-to-r from-on-primary-fixed-variant/60 via-secondary-container/40 to-background/90"
      ></div>
      <div
        class="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent"
      ></div>
      @if (profile.hasValue()) {
        <a
          routerLink="/settings"
          class="absolute top-4 right-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-label-md text-on-primary shadow-[0_0_16px_rgba(208,188,255,0.4)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">edit</span>
          Chỉnh sửa hồ sơ
        </a>
      }
    </div>

    <div class="relative z-10 -mt-20 px-space-md sm:px-space-lg">
      @if (profile.error()) {
        <div
          role="alert"
          class="mt-24 flex flex-col items-center gap-3 rounded-2xl bg-surface-container-low px-6 py-12 text-center"
        >
          <span class="material-symbols-outlined text-5xl! text-error" aria-hidden="true"
            >error</span
          >
          <p class="text-body-lg text-on-surface-variant">{{ errorMessage() }}</p>
          <button
            type="button"
            class="rounded-xl bg-surface-container-high px-4 py-2 font-label-md text-on-surface hover:bg-surface-bright"
            (click)="profile.reload()"
          >
            Thử lại
          </button>
        </div>
      } @else if (profile.hasValue()) {
        @let user = profile.value();
        <div class="flex flex-col items-start gap-6 md:flex-row md:items-end">
          <div
            class="h-36 w-36 shrink-0 overflow-hidden rounded-2xl bg-surface-container-high shadow-2xl ring-4 ring-surface"
          >
            @if (user.avatarUrl) {
              <img [src]="user.avatarUrl" alt="" class="h-full w-full object-cover" />
            } @else {
              <span
                class="flex h-full w-full items-center justify-center bg-primary-container font-display-lg text-on-primary-container"
                aria-hidden="true"
                >{{ user.fullName.charAt(0).toUpperCase() }}</span
              >
            }
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="font-headline-lg break-words text-on-surface">{{ user.fullName }}</h1>
              @if (user.roles.includes(adminRole)) {
                <span
                  class="rounded-full border border-primary/20 bg-primary-container/20 px-3 py-1 font-label-sm text-primary"
                  >Quản trị viên</span
                >
              }
            </div>
            <p class="mt-1 text-body-md break-all text-outline">{{ user.email }}</p>
            <p class="mt-3 flex items-center gap-2 text-body-md text-on-surface-variant">
              <span class="material-symbols-outlined text-[18px]!" aria-hidden="true"
                >calendar_month</span
              >
              Tham gia từ {{ user.dateCreated | date: 'dd/MM/yyyy' }}
            </p>
            <!-- Số liệu thư viện (đang dùng dữ liệu mẫu) -->
            <dl class="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-body-md">
              @for (stat of stats; track stat.label) {
                <div class="flex items-baseline gap-1.5">
                  <dt class="order-2 text-outline">{{ stat.label }}</dt>
                  <dd class="font-headline-sm text-on-surface">{{ stat.value }}</dd>
                </div>
              }
            </dl>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Nội dung hồ sơ"
          class="mt-10 flex gap-6 overflow-x-auto border-b border-surface-container-high sm:gap-8"
        >
          @for (tab of tabs; track tab.id) {
            <button
              type="button"
              role="tab"
              [id]="'profile-tab-' + tab.id"
              [attr.aria-selected]="activeTab() === tab.id"
              [attr.aria-controls]="'profile-panel-' + tab.id"
              class="-mb-px shrink-0 border-b-2 pb-4 font-headline-sm transition-colors focus-visible:outline-2 focus-visible:outline-secondary"
              [class]="
                activeTab() === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-outline hover:text-on-surface'
              "
              (click)="activeTab.set(tab.id)"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        <div
          role="tabpanel"
          [id]="'profile-panel-' + activeTab()"
          [attr.aria-labelledby]="'profile-tab-' + activeTab()"
          class="mt-8"
        >
          @switch (activeTab()) {
            @case ('overview') {
              <section aria-labelledby="profile-playlists-heading">
                <div class="mb-6 flex items-center justify-between">
                  <h2 id="profile-playlists-heading" class="font-headline-md text-on-surface">
                    Playlist của tôi
                  </h2>
                  @if (playlists.length > overviewPlaylistCount) {
                    <button
                      type="button"
                      class="font-label-md text-secondary hover:underline"
                      (click)="activeTab.set('playlists')"
                    >
                      Xem tất cả
                    </button>
                  }
                </div>
                <app-playlist-grid [playlists]="playlists.slice(0, overviewPlaylistCount)" />
              </section>

              <div class="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
                <section
                  aria-labelledby="profile-artists-heading"
                  class="rounded-2xl bg-surface-container-low p-6"
                >
                  <h2 id="profile-artists-heading" class="mb-4 font-headline-md text-on-surface">
                    Nghệ sĩ đang theo dõi
                  </h2>
                  <app-artist-list [artists]="followedArtists" />
                </section>
                <section
                  aria-labelledby="profile-recent-heading"
                  class="rounded-2xl bg-surface-container-low p-6 lg:col-span-2"
                >
                  <h2 id="profile-recent-heading" class="mb-4 font-headline-md text-on-surface">
                    Nghe gần đây
                  </h2>
                  <app-song-list [rows]="recentRows" emptyText="Bạn chưa nghe bài nào gần đây." />
                </section>
              </div>
            }
            @case ('playlists') {
              <app-playlist-grid [playlists]="playlists" />
            }
            @case ('liked') {
              <div class="rounded-2xl bg-surface-container-low p-4 sm:p-6">
                <app-song-list [rows]="likedRows" emptyText="Bạn chưa thích bài hát nào." />
              </div>
            }
          }
        </div>
      } @else {
        <!-- Khung chờ trong lúc tải hồ sơ -->
        <div
          class="flex animate-pulse flex-col items-start gap-6 md:flex-row md:items-end"
          aria-busy="true"
        >
          <span class="sr-only">Đang tải hồ sơ...</span>
          <div class="h-36 w-36 rounded-2xl bg-surface-container-high ring-4 ring-surface"></div>
          <div class="flex-1 space-y-3">
            <div class="h-8 w-56 rounded-lg bg-surface-container-high"></div>
            <div class="h-4 w-40 rounded bg-surface-container-high"></div>
            <div class="h-4 w-32 rounded bg-surface-container-high"></div>
          </div>
        </div>
      }
    </div>
  `,
})
export class Profile {
  private readonly profileService = inject(ProfileService);

  protected readonly adminRole = ADMIN_ROLE;
  protected readonly profile = rxResource({ stream: () => this.profileService.getProfile() });

  protected readonly errorMessage = () => getApiErrors(this.profile.error())[0];

  // Tab "Thống kê" của mẫu nằm ngoài MVP nên không làm.
  protected readonly tabs: { id: ProfileTab; label: string }[] = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'playlists', label: `Playlist (${MOCK_PLAYLISTS.length})` },
    { id: 'liked', label: `Đã thích (${MOCK_LIKED_SONGS.length})` },
  ];
  protected readonly activeTab = signal<ProfileTab>('overview');

  // Dữ liệu mẫu, thay bằng API ở task "Hồ sơ: hiện playlist, bài đã thích, nghệ sĩ đang theo dõi, nghe gần đây".
  protected readonly playlists = MOCK_PLAYLISTS;
  protected readonly overviewPlaylistCount = 4;
  protected readonly followedArtists = MOCK_FOLLOWED_ARTISTS;
  protected readonly likedRows: SongRow[] = MOCK_LIKED_SONGS.map((track) => ({
    track,
    meta: formatDuration(track.durationSec),
  }));
  protected readonly recentRows: SongRow[] = MOCK_RECENT_LISTENS.map(({ track, listenedAt }) => ({
    track,
    meta: `Đã nghe lúc ${formatDate(listenedAt, 'HH:mm dd/MM', 'en-US')}`,
  }));
  protected readonly stats = [
    { label: 'playlist', value: MOCK_PLAYLISTS.length },
    { label: 'bài đã thích', value: MOCK_LIKED_SONGS.length },
    { label: 'nghệ sĩ đang theo dõi', value: MOCK_FOLLOWED_ARTISTS.length },
  ];
}

type ProfileTab = 'overview' | 'playlists' | 'liked';
