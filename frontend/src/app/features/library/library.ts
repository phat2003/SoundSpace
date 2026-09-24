import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/components/page-placeholder/page-placeholder';

@Component({
  selector: 'app-library',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder title="Thư viện" icon="library_music" />`,
})
export class Library {}
