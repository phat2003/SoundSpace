import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/components/page-placeholder/page-placeholder';

@Component({
  selector: 'app-now-playing',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder title="Đang phát" icon="play_circle" />`,
})
export class NowPlaying {}
