import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleDetail, UserDetail, PermissionDetail, PermissionEnum } from '@/types';
import { RoleService } from '@/service/role.service';
import { AuthService } from '@/service/auth.service';
import { UserService } from '@/service/user.service';
import { PermissionService } from '@/service/permission.service';
import { Subscription } from 'rxjs';
import { NzMessageService, NzNotificationService } from 'ng-zorro-antd';
import { HasPermission } from '@/decorators/has-permission';

@Component({
  selector: 'app-self',
  templateUrl: './self.component.html',
})
export class SelfComponent implements OnInit, OnDestroy {
  public self: UserDetail;
  public roleList: RoleDetail[];
  public getSelf$: Subscription;
  public updateUser$: Subscription;
  public updatePassword$: Subscription;
  public getRoleList$: Subscription;
  public getPermissionList$: Subscription;
  public logout$: Subscription;
  public permissionList: PermissionDetail[] = [];
  public validateForm: FormGroup;
  public passwordDisabled = true;
  public changeControll = {
    name: false,
    password: false,
    mobile: false,
    email: false,
    role: false,
    permissionIds: false,
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private permissionService: PermissionService,
    private fb: FormBuilder,
    private roleService: RoleService,
    private message: NzMessageService,
    private notification: NzNotificationService,
  ) {}

  public ngOnInit() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      password: [null],
      mobile: [null, [Validators.required]],
      email: [null, [Validators.required]],
      role: [null],
      permissionIds: [null],
    });
    this.validateForm.disable();
    this.getSelf();
    this.getRoleList();
    this.getPermissionList();
  }

  public ngOnDestroy() {
    if (this.getSelf$) this.getSelf$.unsubscribe();
    if (this.updatePassword$) this.updatePassword$.unsubscribe();
    if (this.getRoleList$) this.getRoleList$.unsubscribe();
    if (this.getPermissionList$) this.getPermissionList$.unsubscribe();
    if (this.updateUser$) this.updateUser$.unsubscribe();
    if (this.logout$) this.logout$.unsubscribe();
  }

  public async getSelf() {
    if (this.getSelf$) this.getSelf$.unsubscribe();
    this.getSelf$ = this.authService.getSelf().subscribe((res) => {
      if (res.success) {
        this.self = res.data;
        const ids = res.data.permissionList ? res.data.permissionList.map(permission => permission.id) : [];
        this.validateForm.setValue({
          name: res.data.name,
          password: null,
          mobile: res.data.mobile,
          email: res.data.email,
          role: res.data.role ? res.data.role.id : null,
          permissionIds: ids,
        });
        this.validateForm.controls['name'].setValidators([Validators.required]);
        this.validateForm.controls['password'].setValidators(null);
        this.validateForm.controls['mobile'].setValidators([Validators.required]);
        this.validateForm.controls['email'].setValidators([Validators.required]);
        this.validateForm.controls['role'].setValidators(null);
        this.validateForm.controls['permissionIds'].setValidators(null);
      } else {
        this.notification.error('获取个人信息失败', res.message, {
          nzDuration: 4000,
        });
      }
    });
  }

  private getRoleList() {
    if (this.getRoleList$) this.getRoleList$.unsubscribe();
    this.getRoleList$ = this.roleService.getRoleList().subscribe(res => {
      if (res.success) this.roleList = res.data[0];
      else this.message.error('搜索角色列表失败');
    });
  }

  public getPermissionList() {
    if (this.getPermissionList$) this.getPermissionList$.unsubscribe();
    this.getPermissionList$ = this.permissionService.getPermissionList().subscribe(res => {
      if (res.success) this.permissionList = res.data[0];
      else this.message.error('获取权限列表失败');
    });
  }

  public updateUser(type: string) {
    if (this.updateUser$) this.updateUser$.unsubscribe();
    this.validateForm.controls[type].markAsDirty();
    this.validateForm.controls[type].updateValueAndValidity();
    const params = { [type]: this.validateForm.value[type] };
    this.updateUser$ = this.userService.updateUser(this.authService.self.id, params).subscribe(res => {
      if (res.success) {
        this.changeControll[type] = false;
        this.validateForm.controls[type].disable();
        this.getSelf();
        this.notification.success('成功', '更新个人信息成功', {
          nzDuration: 2000,
        });
        if (type === 'mobile' || type === 'email') {
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        }
      } else {
        this.notification.error('失败', `更新个人信息失败，原因：${res.message}`, {
          nzDuration: 2000,
        });
      }
    });
  }

  public updatePassword() {
    if (this.updatePassword$) this.updatePassword$.unsubscribe();
    this.updatePassword$ = this.userService.updatePassword(this.authService.self.id, this.validateForm.value.password).subscribe(res => {
      if (res.success) {
        this.validateForm.controls.password.setValue(null);
        this.changeControll.password = false;
        this.validateForm.controls.password.disable();
        this.notification.success('成功', '更新密码成功，3秒后将重新登录', {
          nzDuration: 3000,
        });
        if (this.logout$) this.logout$.unsubscribe();
        this.authService.logout().subscribe(() => {
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        });
      } else {
        this.notification.error('失败', `更新密码失败，原因：${res.message}`, {
          nzDuration: 2000,
        });
      }
    });
  }

  @HasPermission(PermissionEnum.changeSelfRole)
  public changeWithPermission(type: string) {
    this.change(type);
  }

  public change(type: string) {
    this.changeControll[type] = true;
    this.validateForm.controls[type].enable();
  }

  public confirm(type: string) {
    if (type === 'password') this.updatePassword();
    else this.updateUser(type);
  }

}
