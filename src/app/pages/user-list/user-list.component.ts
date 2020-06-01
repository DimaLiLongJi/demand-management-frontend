import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { UserDetail, User, PermissionEnum } from '@/types';
import { UserService } from '@/service/user.service';
import { Subscription } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd';
import { API_URL } from '@/service/environment.service';
import { HasPermission } from '@/decorators/has-permission';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit, OnDestroy {
  public searchData: {
    pageIndex: number,
    pageSize: number,
    isOn?: '1' | '2' | '',
    keyword?: string,
  } = {
    pageIndex: 1,
    pageSize: 5,
    isOn: '',
    keyword: null,
  };
  public userList: UserDetail[] = [];
  public total = null;
  public userCreatorVisible = false;
  public activeUserId: number; // 编辑的权限ID

  public getUserList$: Subscription;
  public updateUser$: Subscription;

  constructor(
    private userService: UserService,
    private message: NzMessageService,
    @Inject(API_URL) public rootUrl: string,
  ) { }

  public ngOnInit() {
    this.getUserList(this.searchData);
  }

  public ngOnDestroy() {
    if (this.getUserList$) this.getUserList$.unsubscribe();
    if (this.updateUser$) this.updateUser$.unsubscribe();
  }

  public async pageIndexChange(pageIndex: number) {
    this.searchData.pageIndex = pageIndex;
    this.getUserList({
      ...this.searchData,
      pageIndex,
    });
  }

  private getUserList(searchData: {
    type?: '1' | '2' | '',
    pageIndex: number,
    pageSize: number,
    isOn?: '1' | '2' | '',
  }) {
    if (this.getUserList$) this.getUserList$.unsubscribe();
    this.getUserList$ = this.userService.getUserList(searchData).subscribe(res => {
      if (res.success) {
        this.searchData = searchData;
        this.userList = res.data[0];
        this.total = res.data[1];
        this.message.success('搜索用户列表成功');
      } else {
        this.message.error('搜索用户列表失败');
      }
    });
  }

  public changeUserCreatorModal(visible: boolean) {
    this.userCreatorVisible = visible;
    this.activeUserId = null;
    this.getUserList({
      ...this.searchData,
      pageIndex: 1,
    });
  }

  @HasPermission(PermissionEnum.updateUser)
  public deleteUser(user: User, isDelete: boolean) {
    if (this.updateUser$) this.updateUser$.unsubscribe();
    if (!isDelete) user.deleteDate = null;
    else user.deleteDate = new Date();
    this.updateUser$ = this.userService.updateUser(user.id, {
      isOn: isDelete ? '2' : '1',
    }).subscribe(res => {
      if (res.success) {
        this.message.success('更新用户成功');
        this.getUserList(this.searchData);
      } else {
        this.message.error('更新用户失败');
      }
    });
  }

  @HasPermission(PermissionEnum.updateUser)
  public editUser(id: number) {
    this.activeUserId = id;
    this.userCreatorVisible = true;
  }

  @HasPermission(PermissionEnum.createUser)
  public addUser() {
    this.userCreatorVisible = true;
  }

  public exportExcel() {
    let excelExportUrl = `${this.rootUrl}/api/user/download?`;
    const searchData = {...this.searchData};
    delete searchData.pageIndex;
    delete searchData.pageSize;
    const keys = Object.keys(searchData);
    keys.forEach(key => {
      if (!searchData[key]) return;
      excelExportUrl += `${key}=${searchData[key]}&`;
    });
    return excelExportUrl;
  }

}
