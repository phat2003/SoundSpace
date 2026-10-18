import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/auth/auth.guards';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        title: 'Khám phá · SoundSpace',
        loadComponent: () => import('./features/explore/explore').then((m) => m.Explore),
      },
      {
        path: 'genres',
        title: 'Thể loại · SoundSpace',
        loadComponent: () => import('./features/genres/genres').then((m) => m.Genres),
      },
      {
        path: 'search',
        title: 'Tìm kiếm · SoundSpace',
        loadComponent: () => import('./features/search/search').then((m) => m.Search),
      },
      {
        path: 'now-playing',
        title: 'Đang phát · SoundSpace',
        loadComponent: () => import('./features/now-playing/now-playing').then((m) => m.NowPlaying),
      },
      {
        path: 'song/:id',
        title: 'Bài hát · SoundSpace',
        loadComponent: () => import('./features/song/song-detail').then((m) => m.SongDetail),
      },
      {
        path: 'library',
        canActivate: [authGuard],
        title: 'Thư viện · SoundSpace',
        loadComponent: () => import('./features/library/library').then((m) => m.Library),
      },
      {
        path: 'favorites',
        canActivate: [authGuard],
        title: 'Yêu thích · SoundSpace',
        loadComponent: () => import('./features/favorites/favorites').then((m) => m.Favorites),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        title: 'Hồ sơ · SoundSpace',
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'settings',
        canActivate: [authGuard],
        title: 'Cài đặt · SoundSpace',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        title: 'Quản trị · SoundSpace',
        loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        title: 'Đăng nhập · SoundSpace',
        loadComponent: () => import('./features/auth/login').then((m) => m.Login),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        title: 'Đăng ký · SoundSpace',
        loadComponent: () => import('./features/auth/register').then((m) => m.Register),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
