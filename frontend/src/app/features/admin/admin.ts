import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/components/page-placeholder/page-placeholder';

@Component({
  selector: 'app-admin',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder title="Quản trị" icon="admin_panel_settings" />`,
})
export class Admin {}
