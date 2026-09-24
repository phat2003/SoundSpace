import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/components/page-placeholder/page-placeholder';

@Component({
  selector: 'app-settings',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder title="Cài đặt" icon="settings" />`,
})
export class Settings {}
