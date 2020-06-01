import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModuleDetail } from '@/types';
import { ModuleService } from '@/service/module.service';
import { PermissionService } from '@/service/permission.service';
import { NzNotificationService, NzMessageService } from 'ng-zorro-antd';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-permission-creator',
  templateUrl: './permission-creator.component.html',
})
export class PermissionCreatorComponent implements OnInit, OnDestroy {
  @Input() public permissionId: number;
  @Input() public modalVisible = false;
  @Output() private changeModal = new EventEmitter<boolean>();
  public validateForm: FormGroup;
  public isOkLoading = false;

  private createPermission$: Subscription;
  private getModuleList$: Subscription;
  private updatePermission$: Subscription;
  private getPermissionById$: Subscription;

  public moduleList: ModuleDetail[];
  public showRoute = true;
  public modalTitle = '新增权限';

  constructor(
    private moduleService: ModuleService,
    private permissionService: PermissionService,
    private notification: NzNotificationService,
    private message: NzMessageService,
    private fb: FormBuilder,
  ) { }

  public ngOnInit() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      type: ['1', [Validators.required]],
      route: [null, [Validators.required]],
      operating: [null],
      module: [null, [Validators.required]],
    });
  }

  public ngOnDestroy() {
    if (this.getModuleList$) this.getModuleList$.unsubscribe();
    if (this.createPermission$) this.createPermission$.unsubscribe();
    if (this.updatePermission$) this.updatePermission$.unsubscribe();
    if (this.getPermissionById$) this.getPermissionById$.unsubscribe();
  }

  public afterOpen() {
    this.validateForm.setValue({
      name: null,
      type: '1',
      route: null,
      operating: null,
      module: null,
    });
    this.validateForm.controls['name'].setValidators([Validators.required]);
    this.validateForm.controls['type'].setValidators([Validators.required]);
    this.validateForm.controls['route'].setValidators([Validators.required]);
    this.validateForm.controls['operating'].setValidators(null);
    this.validateForm.controls['module'].setValidators([Validators.required]);
    this.getModuleList();
    if (this.permissionId) {
      this.modalTitle = '编辑权限';
      this.getPermissionById(this.permissionId);
    } else {
      this.modalTitle = '新增权限';
    }
  }

  public afterClose() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      type: ['1', [Validators.required]],
      route: [null, [Validators.required]],
      operating: [null],
      module: [null, [Validators.required]],
    });
  }

  public getPermissionById(id: number) {
    if (this.getPermissionById$) this.getPermissionById$.unsubscribe();
    this.getPermissionById$ = this.permissionService.getById(id).subscribe(res => {
      if (res.success) {
        this.validateForm.setValue({
          name: res.data.name,
          type: res.data.type,
          route: res.data.route,
          operating: res.data.operating,
          module: res.data.module ? res.data.module.id : null,
        });
        this.validateForm.controls['name'].setValidators([Validators.required]);
        this.validateForm.controls['type'].setValidators([Validators.required]);
        this.validateForm.controls['route'].setValidators([Validators.required]);
        this.validateForm.controls['operating'].setValidators(null);
        this.validateForm.controls['module'].setValidators([Validators.required]);
        this.typeChange(res.data.type);
      } else {
        this.message.error('获取权限详情失败');
      }
    });
  }

  public handleCancel() {
    this.changeModal.emit(false);
    this.isOkLoading = false;
    this.validateForm.reset();
    this.validateForm.controls['type'].patchValue('1');
    this.getModuleList();
  }

  public buildParams() {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (!this.validateForm.valid) {
      this.notification.error('失败', `${this.permissionId ? '修改' : '创建'}权限失败，请检查表单信息`, {
        nzDuration: 2000,
      });
      return;
    }
    this.isOkLoading = true;
    if (this.showRoute) {
      return {
        name: this.validateForm.value['name'],
        type: this.validateForm.value['type'],
        route: this.validateForm.value['route'],
        operating: null,
        module: this.validateForm.value['module'],
      };
    } else {
      return {
        name: this.validateForm.value['name'],
        type: this.validateForm.value['type'],
        route: null,
        operating: this.validateForm.value['operating'],
        module: this.validateForm.value['module'],
      };
    }
  }

  public handleOnOk() {
    if (this.permissionId) this.updatePermission();
    else this.addPermission();
  }

  public addPermission() {
    const params = this.buildParams();
    if (!params) return;
    // return;

    if (this.createPermission$) this.createPermission$.unsubscribe();
    this.createPermission$ = this.permissionService.createPermission(params).subscribe(res => {
      this.isOkLoading = false;
      if (res.success) {
        this.changeModal.emit(false);
        this.validateForm.reset();
        this.notification.success('成功', '创建模块成功', {
          nzDuration: 2000,
        });
      } else {
        this.notification.error('失败', `创建模块失败，原因：${res.message}`, {
          nzDuration: 2000,
        });
      }
    });
  }

  public updatePermission() {
    const params = this.buildParams();
    if (!params) return;

    if (this.updatePermission$) this.updatePermission$.unsubscribe();
    this.updatePermission$ = this.permissionService.updatePermission(this.permissionId, params).subscribe(res => {
      this.isOkLoading = false;
      if (res.success) {
        this.changeModal.emit(false);
        this.validateForm.reset();
        this.notification.success('成功', '更新模块成功', {
          nzDuration: 2000,
        });
      } else {
        this.notification.error('失败', `更新模块失败，原因：${res.message}`, {
          nzDuration: 2000,
        });
      }
    });
  }

  public getModuleList() {
    if (this.getModuleList$) this.getModuleList$.unsubscribe();
    this.getModuleList$ = this.moduleService.getModuleList().subscribe(res => {
      if (res.success) {
        this.moduleList = res.data[0];
        if (this.moduleList[0]) this.validateForm.patchValue({ module: this.moduleList[0].id });
      } else {
        this.message.error('获取模块列表失败');
      }
    });
  }

  public typeChange(type: string) {
    this.validateForm.controls['route'].clearValidators();
    this.validateForm.controls['operating'].clearValidators();
    if (type === '1') {
      this.showRoute = true;
      this.validateForm.controls['route'].setValidators([Validators.required]);
    }
    if (type === '2') {
      this.showRoute = false;
      this.validateForm.controls['operating'].setValidators([Validators.required]);
    }
  }
}
