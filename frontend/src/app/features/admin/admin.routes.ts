import { Routes } from '@angular/router';

// Các trang con chưa làm dùng tạm PagePlaceholder; title / icon truyền qua data (withComponentInputBinding).
const placeholder = () =>
  import('../../shared/components/page-placeholder/page-placeholder').then(
    (m) => m.PagePlaceholder,
  );

/** Các trang quản trị, nằm dưới /admin (adminGuard đặt ở route cha trong app.routes.ts). */
export const adminRoutes: Routes = [
  {
    path: '',
    title: 'Quản trị · SoundSpace',
    loadComponent: () => import('./admin').then((m) => m.Admin),
  },
  {
    path: 'genres',
    title: 'Quản lý thể loại · SoundSpace',
    loadComponent: () => import('./genres/genre-list').then((m) => m.GenreList),
  },
  {
    path: 'artists',
    title: 'Quản lý nghệ sĩ · SoundSpace',
    loadComponent: () => import('./artists/artist-list').then((m) => m.ArtistList),
  },
  {
    path: 'artists/new',
    title: 'Thêm nghệ sĩ · SoundSpace',
    loadComponent: () => import('./artists/artist-form').then((m) => m.ArtistForm),
  },
  {
    // :id được gán vào input id của ArtistForm (withComponentInputBinding).
    path: 'artists/:id/edit',
    title: 'Sửa nghệ sĩ · SoundSpace',
    loadComponent: () => import('./artists/artist-form').then((m) => m.ArtistForm),
  },
  {
    path: 'albums',
    title: 'Quản lý album · SoundSpace',
    loadComponent: placeholder,
    data: { title: 'Album', icon: 'album' },
  },
  {
    path: 'songs',
    title: 'Quản lý bài hát · SoundSpace',
    loadComponent: placeholder,
    data: { title: 'Bài hát', icon: 'music_note' },
  },
  {
    path: 'users',
    title: 'Quản lý người dùng · SoundSpace',
    loadComponent: () => import('./users/user-list').then((m) => m.UserList),
  },
];
