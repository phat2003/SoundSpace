import { Routes } from '@angular/router';
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
        title: 'Thư viện · SoundSpace',
        loadComponent: () => import('./features/library/library').then((m) => m.Library),
      },
      {
        path: 'favorites',
        title: 'Yêu thích · SoundSpace',
        loadComponent: () => import('./features/favorites/favorites').then((m) => m.Favorites),
      },
      {
        path: 'settings',
        title: 'Cài đặt · SoundSpace',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
      {
        // TODO: add an admin guard once login + roles exist.
        path: 'admin',
        title: 'Quản trị · SoundSpace',
        loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
      },
      {
        path: 'login',
        title: 'Đăng nhập · SoundSpace',
        loadComponent: () => import('./features/auth/login').then((m) => m.Login),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
