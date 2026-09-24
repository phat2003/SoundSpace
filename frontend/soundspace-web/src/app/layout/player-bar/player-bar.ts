import { Component, computed, inject } from '@angular/core';
import { PlayerService } from '../../core/player/player.service';
import { formatDuration } from '../../shared/utils/format-duration';

@Component({
  selector: 'app-player-bar',
  templateUrl: './player-bar.html',
  host: {
    role: 'region',
    'aria-label': 'Trình phát nhạc',
    class:
      'fixed right-0 bottom-0 left-0 z-50 flex h-24 items-center justify-between gap-4 bg-surface-container-low/90 px-space-md backdrop-blur-xl sm:px-space-lg',
  },
})
export class PlayerBar {
  protected readonly player = inject(PlayerService);
  protected readonly formatDuration = formatDuration;

  protected readonly volumeIcon = computed(() => {
    const volume = this.player.muted() ? 0 : this.player.volume();
    if (volume === 0) return 'volume_off';
    return volume < 0.5 ? 'volume_down' : 'volume_up';
  });

  protected readonly repeatLabel = computed(() => {
    const labels = { off: 'Lặp lại: tắt', all: 'Lặp lại: danh sách', one: 'Lặp lại: một bài' };
    return labels[this.player.repeat()];
  });
}
