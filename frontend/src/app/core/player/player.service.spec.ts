import { TestBed } from '@angular/core/testing';
import { PlayerService } from './player.service';

describe('PlayerService', () => {
  let player: PlayerService;

  beforeEach(() => {
    player = TestBed.inject(PlayerService);
  });

  it('toggles play / pause', () => {
    expect(player.isPlaying()).toBe(false);
    player.togglePlay();
    expect(player.isPlaying()).toBe(true);
    player.togglePlay();
    expect(player.isPlaying()).toBe(false);
  });

  it('cycles repeat mode off -> all -> one -> off', () => {
    player.cycleRepeat();
    expect(player.repeat()).toBe('all');
    player.cycleRepeat();
    expect(player.repeat()).toBe('one');
    player.cycleRepeat();
    expect(player.repeat()).toBe('off');
  });

  it('keeps seek position within the track length', () => {
    player.seek(-10);
    expect(player.position()).toBe(0);
    player.seek(10_000);
    expect(player.position()).toBe(player.duration());
  });
});
