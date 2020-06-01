import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PermissionDetail, RoleDetail } from '@/types';
import { RoleService } from '@/service/role.service';
import { UserService } from '@/service/user.service';
import { PermissionService } from '@/service/permission.service';
import { NzNotificationService, NzMessageService } from 'ng-zorro-antd';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-creator',
  templateUrl: './user-creator.component.html',
})
export class UserCreatorComponent implements OnInit, OnDestroy {
  @Input() public userId: number;
  @Input() public modalVisible = false;
  @Output() private changeModal = new EventEmitter<boolean>();
  public validateForm: FormGroup;
  public isOkLoading = false;

  private createUser$: Subscription;
  private getPermissionList$: Subscription;
  private getRoleList$: Subscription;
  private updateUser$: Subscription;
  private getUserById$: Subscription;

  public permissionList: PermissionDetail[];
  public roleList: RoleDetail[];
  public showRoute = true;
  public modalTitle = '新增用户';

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private notification: NzNotificationService,
    private message: NzMessageService,
    private fb: FormBuilder,
  ) { }

  public ngOnInit() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      mobile: [null, [Validators.required]],
      email: [null, [Validators.required]],
      role: [null],
      permissionIds: [null],
    });
  }

  public ngOnDestroy() {
    if (this.getPermissionList$) this.getPermissionList$.unsubscribe();
    if (this.getRoleList$) this.getRoleList$.unsubscribe();
    if (this.createUser$) this.createUser$.unsubscribe();
    if (this.updateUser$) this.updateUser$.unsubscribe();
    if (this.getUserById$) this.getUserById$.unsubscribe();
  }

  public afterOpen() {
    this.getPermissionList();
    this.getRoleList();
    if (this.userId) {
      this.modalTitle = '编辑用户';
      this.getUserById(this.userId);
    } else {
      this.modalTitle = '新增用户';
      this.validateForm.setValue({
        name: null,
        mobile: null,
        email: null,
        role: null,
        permissionIds: null,
      });
      this.validateForm.controls['name'].setValidators([Validators.required]);
      this.validateForm.controls['mobile'].setValidators([Validators.required]);
      this.validateForm.controls['email'].setValidators([Validators.required]);
      this.validateForm.controls['role'].setValidators(null);
      this.validateForm.controls['permissionIds'].setValidators(null);
    }
  }

  public afterClose() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      mobile: [null, [Validators.required]],
      email: [null, [Validators.required]],
      role: [null],
      permissionIds: [null],
    });
  }

  public getUserById(id: number) {
    if (this.getUserById$) this.getUserById$.unsubscribe();
    this.getUserById$ = this.userService.getById(id).subscribe(res => {
      if (res.success) {
        const ids = res.data.permissionList ? res.data.permissionList.map(permission => permission.id) : [];
        this.validateForm.setValue({
          name: res.data.name,
          mobile: res.data.mobile,
          email: res.data.email,
          role: res.data.role ? res.data.role.id : null,
          permissionIds: ids,
        });
        this.validateForm.controls['name'].setValidators([Validators.required]);
        this.validateForm.controls['mobile'].setValidators([Validators.required]);
        this.validateForm.controls['email'].setValidators([Validators.required]);
        this.validateForm.controls['role'].setValidators(null);
        this.validateForm.controls['permissionIds'].setValidators(null);
      } else {
        this.message.error('获取用户详情失败');
      }
    });
  }

  public handleCancel() {
    this.changeModal.emit(false);
    this.isOkLoading = false;
    this.validateForm.reset();
    this.getPermissionList();
    this.getRoleList();
  }

  public buildParams() {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (!this.validateForm.valid) {
      this.notification.error('失败', `${this.userId ? '修改' : '创建'}用户失败，请检查表单信息`, {
        nzDuration: 2000,
      });
      return;
    }
    this.isOkLoading = true;
    if (this.userId) {
      return {
        name: this.validateForm.value['name'],
        mobile: this.validateForm.value['mobile'],
        email: this.validateForm.value['email'],
        role: this.validateForm.value['role'],
        permissionIds: this.validateForm.value['permissionIds'],
      };
    } else {
      return {
        name: this.validateForm.value['name'],
        mobile: this.validateForm.value['mobile'],
        email: this.validateForm.value['email'],
        password: this.validateForm.value['mobile'],
        role: this.validateForm.value['role'],
        permissionIds: this.validateForm.value['permissionIds'],
      };
    }
  }

  public handleOnOk() {
    if (this.userId) this.updateUser();
    else this.addUser();
  }

  public addUser() {
    const params = this.buildParams();
    if (!params) return;

    if (this.createUser$) this.createUser$.unsubscribe();
    this.createUser$ = this.userService.createUser(params).subscribe(res => {
      this.isOkLoading = false;
      if (res.success) {
        this.changeModal.emit(false);
        this.validateForm.reset();
        this.notification.success('成功', '创建角色成功，默认密码是手机号', {
          nzDuration: 3000,
        });
      } else {
        this.notification.error('失败', `创建角色失败，原因：${res.message}`, {
          nzDuration: 2000,
        });
      }
    });
  }

  public updateUser() {
    const params = this.buildParams();
    if (!params) return;

    if (this.updateUser$) this.updateUser$.unsubscribe();
    this.updateUser$ = this.userService.updateUser(this.userId, params).subscribe(res => {
      this.isOkLoading = false;
      if (res.success) {
        this.changeModal.emit(false);
        this.validateForm.reset();
        this.notification.success('成功', '更新用户成功', {
          nzDuration: 2000,
        });
      } else {
        this.notification.error('失败', `更新用户失败，原因：${res.message}`, {
          nzDuration: 2000,
        });
      }
    });
  }

  public getPermissionList() {
    if (this.getPermissionList$) this.getPermissionList$.unsubscribe();
    this.getPermissionList$ = this.permissionService.getPermissionList().subscribe(res => {
      if (res.success) this.permissionList = res.data[0];
      else this.message.error('获取权限列表失败');
    });
  }

  private getRoleList() {
    if (this.getRoleList$) this.getRoleList$.unsubscribe();
    this.getRoleList$ = this.roleService.getRoleList().subscribe(res => {
      if (res.success) this.roleList = res.data[0];
      else this.message.error('搜索角色列表失败');
    });
  }
}
