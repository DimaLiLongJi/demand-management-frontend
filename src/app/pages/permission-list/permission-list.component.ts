import { Component, OnInit, OnDestroy } from '@angular/core';
import { Permission, PermissionDetail } from '@/types';
import { PermissionService } from '@/service/permission.service';
import { Subscription } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-permission-list',
  templateUrl: './permission-list.component.html',
})
export class PermissionListComponent implements OnInit, OnDestroy {
  public searchData: {
    type?: '1' | '2' | '',
    pageIndex: number,
    pageSize: number,
    isOn?: '1' | '2' | '',
  } = {
    type: '',
    pageIndex: 1,
    pageSize: 5,
    isOn: '',
  };
  public permissionList: PermissionDetail[] = [];
  public total = null;
  public moduleCreatorVisible = false;
  public permissionCreatorVisible = false;
  public getPermissionList$: Subscription;
  public updatePermission$: Subscription;
  public activePermissionId: number; // 编辑的权限ID

  constructor(
    private permissionService: PermissionService,
    private message: NzMessageService,
  ) { }

  public ngOnInit() {
    this.getPermissionList(this.searchData);
  }

  public ngOnDestroy() {
    if (this.getPermissionList$) this.getPermissionList$.unsubscribe();
    if (this.updatePermission$) this.updatePermission$.unsubscribe();
  }

  public async pageIndexChange(pageIndex: number) {
    this.searchData.pageIndex = pageIndex;
    this.getPermissionList({
      ...this.searchData,
      pageIndex,
    });
  }

  private getPermissionList(searchData: {
    type?: '1' | '2' | '',
    pageIndex: number,
    pageSize: number,
    isOn?: '1' | '2' | '',
  }) {
    if (this.getPermissionList$) this.getPermissionList$.unsubscribe();
    this.getPermissionList$ = this.permissionService.getPermissionList(searchData).subscribe(res => {
      if (res.success) {
        this.searchData = searchData;
        this.permissionList = res.data[0];
        this.total = res.data[1];
        this.message.success('搜索权限列表成功');
      } else {
        this.message.error('搜索权限列表失败');
      }
    });
  }

  public changeModuleCreatorModal(visible: boolean) {
    this.moduleCreatorVisible = visible;
  }

  public changePermissionCreatorModal(visible: boolean) {
    this.permissionCreatorVisible = visible;
    this.activePermissionId = null;
    this.getPermissionList({
      ...this.searchData,
      // pageIndex: 1,
    });
  }

  public deletePermission(permission: Permission, isDelete: boolean) {
    if (this.updatePermission$) this.updatePermission$.unsubscribe();
    if (!isDelete) permission.deleteDate = null;
    else permission.deleteDate = new Date();
    this.updatePermission$ = this.permissionService.updatePermission(permission.id, {
      isOn: isDelete ? '2' : '1',
    }).subscribe(res => {
      if (res.success) {
        this.message.success('更新权限成功');
        this.getPermissionList(this.searchData);
      } else {
        this.message.error('更新权限失败');
      }
    });
  }

  public editPermission(id: number) {
    this.activePermissionId = id;
    this.permissionCreatorVisible = true;
  }

}
