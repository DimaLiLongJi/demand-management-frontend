import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd';
import { AuthService } from '@/service/auth.service';
import { PermissionDetail } from '@/types';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionControllerService {
  constructor(
    private authService: AuthService,
    private notification: NzNotificationService,
  ) { }
  public permissionList$: Subscription;
  public selfPermissionList: PermissionDetail[];

  public hasPermission(
    permission?: string,
    success?: (list?: PermissionDetail[]) => any,
    error?: (list?: PermissionDetail[]) => any
  ): void {
    if (this.permissionList$) this.permissionList$.unsubscribe();
    this.permissionList$ = this.authService.permissionList$.subscribe(permissionList => {
      this.selfPermissionList = permissionList;
      if (permission && !this.selfPermissionList.find(per => per.operating === permission)) {
        if (error) error(permissionList);
        else this.notification.error('失败', `你没有【${permission}】权限，请联系管理员`, {
          nzDuration: 3000,
        });
      } else {
        if (success) success(permissionList);
      }
    });
  }
}
