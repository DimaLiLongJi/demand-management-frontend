import { Component, OnInit, OnDestroy } from '@angular/core';
import { Role, RoleDetail } from '@/types';
import { RoleService } from '@/service/role.service';
import { Subscription } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
})
export class RoleListComponent implements OnInit, OnDestroy {
  public searchData: {
    pageIndex: number,
    pageSize: number,
    isOn?: '1' | '2' | '',
  } = {
      pageIndex: 1,
      pageSize: 5,
      isOn: '',
    };
  public roleList: RoleDetail[] = [];
  public total = null;
  public roleCreatorVisible = false;
  public activeRoleId: number; // 编辑的权限ID

  public getRoleList$: Subscription;
  public updateRole$: Subscription;

  constructor(
    private roleService: RoleService,
    private message: NzMessageService,
  ) { }

  public ngOnInit() {
    this.getRoleList(this.searchData);
  }

  public ngOnDestroy() {
    if (this.getRoleList$) this.getRoleList$.unsubscribe();
    if (this.updateRole$) this.updateRole$.unsubscribe();
  }

  public async pageIndexChange(pageIndex: number) {
    this.searchData.pageIndex = pageIndex;
    this.getRoleList({
      ...this.searchData,
      pageIndex,
    });
  }

  private getRoleList(searchData: {
    type?: '1' | '2' | '',
    pageIndex: number,
    pageSize: number,
    isOn?: '1' | '2' | '',
  }) {
    if (this.getRoleList$) this.getRoleList$.unsubscribe();
    this.getRoleList$ = this.roleService.getRoleList(searchData).subscribe(res => {
      if (res.success) {
        this.searchData = searchData;
        this.roleList = res.data[0];
        this.total = res.data[1];
        this.message.success('搜索角色列表成功');
      } else {
        this.message.error('搜索角色列表失败');
      }
    });
  }

  public changeRoleCreatorModal(visible: boolean) {
    this.roleCreatorVisible = visible;
    this.activeRoleId = null;
    this.getRoleList({
      ...this.searchData,
      pageIndex: 1,
    });
  }

  public deleteRole(role: Role, isDelete: boolean) {
    if (this.updateRole$) this.updateRole$.unsubscribe();
    if (!isDelete) role.deleteDate = null;
    else role.deleteDate = new Date();
    this.updateRole$ = this.roleService.updateRole(role.id, {
      isOn: isDelete ? '2' : '1',
    }).subscribe(res => {
      if (res.success) {
        this.message.success('更新用户成功');
        this.getRoleList(this.searchData);
      } else {
        this.message.error('更新用户失败');
      }
    });
  }

  public editRole(id: number) {
    this.activeRoleId = id;
    this.roleCreatorVisible = true;
  }

}
