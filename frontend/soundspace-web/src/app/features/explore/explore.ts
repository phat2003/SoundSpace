import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/components/page-placeholder/page-placeholder';

@Component({
  selector: 'app-explore',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder title="Khám phá" icon="explore" />`,
})
export class Explore {}
