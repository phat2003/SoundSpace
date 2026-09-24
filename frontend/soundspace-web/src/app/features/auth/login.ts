import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/components/page-placeholder/page-placeholder';

@Component({
  selector: 'app-login',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder title="Đăng nhập" icon="login" />`,
})
export class Login {}
