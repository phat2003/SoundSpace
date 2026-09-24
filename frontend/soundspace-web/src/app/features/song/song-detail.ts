import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/components/page-placeholder/page-placeholder';

@Component({
  selector: 'app-song-detail',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder title="Bài hát" icon="music_note" />`,
})
export class SongDetail {}
