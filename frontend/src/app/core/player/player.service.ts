import { computed, Service, signal } from '@angular/core';
import { Track } from '../models/track';

export type RepeatMode = 'off' | 'all' | 'one';

// Sample track shown in the player bar until the API and real audio playback exist.
const DEMO_TRACK: Track = {
  id: 'demo',
  title: 'Neon Horizon',
  artist: 'Stellar Dreams',
  coverUrl: null,
  durationSec: 225,
};

/**
 * Shared player state for the whole app. Lives outside the router outlet,
 * so it survives page navigation.
 *
 * For now it only holds UI state. The "Player" task will add an HTMLAudioElement
 * and make play / seek / next actually control audio.
 */
@Service()
export class PlayerService {
  readonly currentTrack = signal<Track | null>(DEMO_TRACK);
  readonly isPlaying = signal(false);
  readonly position = signal(84);
  readonly volume = signal(0.75);
  readonly muted = signal(false);
  readonly shuffle = signal(false);
  readonly repeat = signal<RepeatMode>('off');

  readonly duration = computed(() => this.currentTrack()?.durationSec ?? 0);

  togglePlay(): void {
    if (this.currentTrack()) {
      this.isPlaying.update((playing) => !playing);
    }
  }

  seek(seconds: number): void {
    this.position.set(Math.min(Math.max(seconds, 0), this.duration()));
  }

  setVolume(volume: number): void {
    this.volume.set(Math.min(Math.max(volume, 0), 1));
    this.muted.set(volume === 0);
  }

  toggleMute(): void {
    this.muted.update((muted) => !muted);
  }

  toggleShuffle(): void {
    this.shuffle.update((shuffle) => !shuffle);
  }

  cycleRepeat(): void {
    const next: Record<RepeatMode, RepeatMode> = { off: 'all', all: 'one', one: 'off' };
    this.repeat.update((mode) => next[mode]);
  }

  // Queue handling comes with the "Hàng chờ" task.
  next(): void {}

  previous(): void {
    this.seek(0);
  }
}
