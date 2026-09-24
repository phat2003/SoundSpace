import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/components/page-placeholder/page-placeholder';

@Component({
  selector: 'app-genres',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder title="Khám phá thể loại" icon="category" />`,
})
export class Genres {}
