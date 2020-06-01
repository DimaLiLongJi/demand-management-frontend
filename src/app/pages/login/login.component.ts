import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@/service/auth.service';
import { SpinControllerService } from '@/service/spin.controller.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { API_URL } from '@/service/environment.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit, OnDestroy {
  public account: string;
  public password: string;
  public login$: Subscription;

  constructor(
    private authService: AuthService,
    private notification: NzNotificationService,
    private router: Router,
    public spinControllerService: SpinControllerService,
    @Inject(API_URL) public rootUrl: string,
  ) { }

  public ngOnInit() {
    if (this.spinControllerService.showSpin) {
      setTimeout(() => {
        this.spinControllerService.update(false);
      }, 500);
    }
  }

  public ngOnDestroy() {
    if (this.login$) this.login$.unsubscribe();
  }

  private verify(): boolean {
    if (!this.account || !this.password) {
      this.notification.error('失败', '请检查账号或密码是否填写！', {
        nzDuration: 2000,
      });
      return false;
    }
    return true;
  }

  public login() {
    if (!this.verify()) return;
    if (this.login$) this.login$.unsubscribe();
    this.login$ = this.authService.login({ account: this.account, password: this.password }).subscribe(res => {
      if (res.success) {
        this.notification.success('成功', '登录成功！', {
          nzDuration: 2000,
        });
        this.router.navigate(['/home']);
      } else {
        this.notification.error('失败', `登录失败！失败原因：${res.message}`, {
          nzDuration: 2000,
        });
      }
    });
  }
}
