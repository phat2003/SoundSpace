import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/components/page-placeholder/page-placeholder';

@Component({
  selector: 'app-favorites',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder title="Yêu thích" icon="favorite" />`,
})
export class Favorites {}
