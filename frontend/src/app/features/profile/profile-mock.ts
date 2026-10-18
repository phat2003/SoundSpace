import { Track } from '../../core/models/track';

// Dữ liệu MẪU cho trang hồ sơ khi chưa có API thư viện (playlist, yêu thích, theo dõi, lịch sử nghe).
// Task "Hồ sơ: hiện playlist, bài đã thích, nghệ sĩ đang theo dõi, nghe gần đây" sẽ thay bằng API thật.
// KHÔNG xoá file này trước khi có API (CLAUDE.md).

export interface PlaylistSummary {
  id: string;
  name: string;
  songCount: number;
  totalSec: number;
  coverUrl: string | null;
}

export interface FollowedArtist {
  id: string;
  name: string;
  followerCount: number;
  avatarUrl: string | null;
}

export interface RecentListen {
  track: Track;
  listenedAt: string;
}

export const MOCK_PLAYLISTS: PlaylistSummary[] = [
  { id: 'p1', name: 'Synthwave Chillout', songCount: 48, totalSec: 11520, coverUrl: null },
  { id: 'p2', name: 'Cyberpunk Workout', songCount: 24, totalSec: 6300, coverUrl: null },
  { id: 'p3', name: 'Midnight Code & Synth', songCount: 64, totalSec: 15600, coverUrl: null },
  { id: 'p4', name: 'Analog Warmth', songCount: 32, totalSec: 7500, coverUrl: null },
  { id: 'p5', name: 'Nhạc Việt buổi sáng', songCount: 18, totalSec: 4020, coverUrl: null },
];

export const MOCK_FOLLOWED_ARTISTS: FollowedArtist[] = [
  { id: 'a1', name: 'The Midnight', followerCount: 1_400_000, avatarUrl: null },
  { id: 'a2', name: 'Kavinsky', followerCount: 980_000, avatarUrl: null },
  { id: 'a3', name: 'GUNSHIP', followerCount: 850_000, avatarUrl: null },
  { id: 'a4', name: 'Timecop1983', followerCount: 720_000, avatarUrl: null },
];

export const MOCK_LIKED_SONGS: Track[] = [
  { id: 's1', title: 'Sunset Odyssey', artist: 'The Midnight', coverUrl: null, durationSec: 274 },
  { id: 's2', title: 'Nightcall (Remix)', artist: 'Kavinsky', coverUrl: null, durationSec: 258 },
  { id: 's3', title: 'Tech Noir', artist: 'GUNSHIP', coverUrl: null, durationSec: 293 },
  { id: 's4', title: 'On the Run', artist: 'Timecop1983', coverUrl: null, durationSec: 241 },
  { id: 's5', title: 'Neon Horizon', artist: 'Stellar Dreams', coverUrl: null, durationSec: 225 },
];

export const MOCK_RECENT_LISTENS: RecentListen[] = [
  { track: MOCK_LIKED_SONGS[0], listenedAt: '2026-10-19T09:48:00Z' },
  { track: MOCK_LIKED_SONGS[1], listenedAt: '2026-10-19T08:10:00Z' },
  { track: MOCK_LIKED_SONGS[2], listenedAt: '2026-10-18T14:30:00Z' },
  { track: MOCK_LIKED_SONGS[3], listenedAt: '2026-10-16T20:05:00Z' },
];
