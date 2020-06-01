import { Component, OnDestroy, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@/service/auth.service';
import { SpinControllerService } from '@/service/spin.controller.service';
import { ModuleDetail } from '@/types';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { API_URL } from '@/service/environment.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnDestroy {
  public isCollapsed = false;
  public menuList: ModuleDetail[] = [];
  public moduleList$: Subscription;
  public permissionList$: Subscription;
  public logout$: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: NzModalService,
    private notification: NzNotificationService,
    public spinControllerService: SpinControllerService,
    @Inject(API_URL) public rootUrl: string,
  ) {
    if (this.moduleList$) this.moduleList$.unsubscribe();
    this.moduleList$ = this.authService.moduleList$.subscribe(moduleList => {
      this.menuList = moduleList.filter(mod => mod.permissionList && mod.permissionList.find(per => per.route));
    });
    if (this.permissionList$) this.permissionList$.unsubscribe();
    this.permissionList$ = this.authService.permissionList$.subscribe(permissionList => {
      if (this.router.url.split('?')[0] === '/home') {
        if (permissionList) {
          const firstPermission = permissionList.find(permission => permission.route);
          if (firstPermission) this.router.navigate([firstPermission.route]).then(() => {
            this.spinControllerService.update(false);
          });
          else this.notification.error('重定向失败', `没有可用的访问权限，请联系管理员配置`, {
            nzDuration: 2000,
          });
        }
      }
    });
  }

  public ngOnDestroy() {
    if (this.moduleList$) this.moduleList$.unsubscribe();
    if (this.permissionList$) this.permissionList$.unsubscribe();
    if (this.logout$) this.logout$.unsubscribe();
  }

  public showLogout() {
    this.modalService.confirm({
      nzTitle: '确定退出登录吗？',
      nzOnOk: () => {
        if (this.logout$) this.logout$.unsubscribe();
        this.logout$ = this.authService.logout().subscribe(res => {
          if (res.success) this.router.navigate(['/page/login']);
          else {
            this.notification.error('失败', `退出登录失败！原因:${res.message}`, {
              nzDuration: 2000,
            });
          }
        });
      }
    });

  }

}
