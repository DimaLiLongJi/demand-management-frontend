import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DemandDetail, Demand, DemandTypeDetail, UserDetail, DemandStatusDetail, PermissionEnum, IDemandSelfSearch } from '@/types';
import { DemandService } from '@/service/demand.service';
import { UserService } from '@/service/user.service';
import { Subscription } from 'rxjs';
import { NzMessageService, NzNotificationService } from 'ng-zorro-antd';
import { HasPermission } from '@/decorators/has-permission';
import { AuthService } from '@/service/auth.service';
import { RoleService } from '@/service/role.service';
import { API_URL } from '@/service/environment.service';
import { PermissionControllerService } from '@/service/permission-controller.service';

@Component({
  selector: 'app-self-demand-list',
  templateUrl: './self-demand-list.component.html',
  styleUrls: ['./self-demand-list.style.less'],
})
export class SelfDemandListComponent implements OnInit, OnDestroy {
  public showMore = false;
  public searchData: IDemandSelfSearch = {
    type: 'creator',
    pageIndex: 1,
    pageSize: 5,
    isOn: '',
    demandType: '',
    demandStatus: '',
    keyword: null,
    timeout: '',
  };
  public demandCreateDate: Date[] = [];
  public demandEndDate: Date[] = [];
  public scheduleStartDate: Date[] = [];
  public scheduleEndDate: Date[] = [];
  public total = null;
  public userList: UserDetail[] = [];
  public demandList: DemandDetail[] = [];
  public demandTypeList: DemandTypeDetail[] = [];
  public demandStatusList: DemandStatusDetail[] = [];
  public demandCreatorVisible = false;
  public getDemandList$: Subscription;
  public updateDemand$: Subscription;
  public passDemand$: Subscription;
  public getDemandTypeList$: Subscription;
  public getUserList$: Subscription;

  public activeDemandId: number = null;
  public demandEditorVisible = false;

  public activeLogDemandId: number = null;
  public demandLogVisible = false;

  constructor(
    private demandService: DemandService,
    private roleService: RoleService,
    private authService: AuthService,
    private userService: UserService,
    private message: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private permissionControllerService: PermissionControllerService,
    private notification: NzNotificationService,
    @Inject(API_URL) public rootUrl: string,
  ) { }

  public ngOnInit() {
    this.getUserList();
    this.getDemandTypeList();
    // 直接打开某个需求
    if (this.activatedRoute.snapshot.queryParamMap.has('demandId')) this.editDemand(Number(this.activatedRoute.snapshot.queryParamMap.get('demandId')));
  }

  public reset() {
    this.searchData = {
      type: 'creator',
      pageIndex: 1,
      pageSize: 5,
      isOn: '',
      demandType: '',
      demandStatus: '',
      keyword: null,
      timeout: '',
    };
    this.demandCreateDate = [];
    this.demandEndDate = [];
    this.scheduleStartDate = [];
    this.scheduleEndDate = [];
    this.getDemandTypeList();
  }

  public ngOnDestroy() {
    if (this.getDemandList$) this.getDemandList$.unsubscribe();
    if (this.updateDemand$) this.updateDemand$.unsubscribe();
    if (this.getDemandTypeList$) this.getDemandTypeList$.unsubscribe();
    if (this.getUserList$) this.getUserList$.unsubscribe();
    if (this.passDemand$) this.passDemand$.unsubscribe();
  }

  public pageIndexChange(pageIndex: number) {
    this.searchData.pageIndex = pageIndex;
    this.getDemandList();
  }

  private buildSearch() {
    const searchData: IDemandSelfSearch = {
      ...this.searchData,
      demandCreateFromDate: this.demandCreateDate[0] && new Date(this.demandCreateDate[0]).toISOString(),
      demandCreateToDate: this.demandCreateDate[1] && new Date(this.demandCreateDate[1]).toISOString(),
      demandEndFromDate: this.demandEndDate[0] && new Date(this.demandEndDate[0]).toISOString(),
      demandEndToDate: this.demandEndDate[1] && new Date(this.demandEndDate[1]).toISOString(),
      scheduleStartFromDate: this.scheduleStartDate[0] && new Date(this.scheduleStartDate[0]).toISOString(),
      scheduleStartToDate: this.scheduleStartDate[1] && new Date(this.scheduleStartDate[1]).toISOString(),
      scheduleEndFromDate: this.scheduleEndDate[0] && new Date(this.scheduleEndDate[0]).toISOString(),
      scheduleEndToDate: this.scheduleEndDate[1] && new Date(this.scheduleEndDate[1]).toISOString(),
    };
    return searchData;
  }

  public getDemandList() {
    const searchData = this.buildSearch();
    if (this.getDemandList$) this.getDemandList$.unsubscribe();
    this.getDemandList$ = this.demandService.getSelfDemandList(searchData).subscribe(res => {
      if (res.success) {
        this.searchData = searchData;
        const today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);

        this.demandList = res.data[0] ? res.data[0].map(demand => {
          let timeout = null;
          const scheduleEndDate = (new Date(demand.scheduleEndDate)).getTime();
          if (demand.scheduleEndDate && today.getTime() < scheduleEndDate) timeout = '1';
          if (demand.scheduleEndDate && today.getTime() === scheduleEndDate) timeout = '2';
          if (demand.scheduleEndDate && today.getTime() > scheduleEndDate) timeout = '3';
          if (demand.finishDate) timeout = '4';
          return {
            ...demand,
            timeout,
          };
        }) : [];
        this.total = res.data[1];
        this.message.success('搜索我的需求列表成功');
      } else {
        this.message.error('搜索我的需求列表失败');
      }
    });
  }

  public getUserList() {
    if (this.getUserList$) this.getUserList$.unsubscribe();
    this.getUserList$ = this.userService.getUserList().subscribe(res => {
      if (res.success) this.userList = res.data[0] || [];
      else this.message.error('获取用户列表失败');
    });
  }

  public getDemandTypeList() {
    if (this.getDemandTypeList$) this.getDemandTypeList$.unsubscribe();
    this.getDemandTypeList$ = this.roleService.getById(this.authService.self.role.id).subscribe(res => {
      if (res.success) {
        this.demandTypeList = res.data.demandTypeList || [];
        this.demandStatusList = this.demandTypeList && this.demandTypeList[0] ? this.demandTypeList[0].demandStatusList : [];
        this.searchData.demandType = this.demandTypeList && this.demandTypeList[0] ? this.demandTypeList[0].id : '';
        this.getDemandList();
      } else this.message.error('获取信息列表失败');
    });
  }

  public demandTypeChange(id: number) {
    const demandStatus = this.demandTypeList ? this.demandTypeList.find(demandType => demandType.id === id) : null;
    this.demandStatusList = demandStatus ? demandStatus.demandStatusList : [];
    this.searchData.demandStatus = '';
  }

  public changeDemandCreatorModal(visible: boolean) {
    this.demandCreatorVisible = visible;
    this.pageIndexChange(1);
  }

  public tryDeleteDemand(demand: Demand, isDelete: boolean) {
    // 创建者拥有全部权限
    if (demand.creator === this.authService.self.id) this.deleteDemand(demand, isDelete);
    else {
      this.permissionControllerService.hasPermission(
        PermissionEnum.updateDemand,
        () => this.deleteDemand(demand, isDelete),
        () => {
          this.notification.error('失败', `你没有【${PermissionEnum.updateDemand}】权限，请联系管理员`, {
            nzDuration: 3000,
          });
        }
      );
    }
  }

  public deleteDemand(demand: Demand, isDelete: boolean) {
    if (this.updateDemand$) this.updateDemand$.unsubscribe();
    if (!isDelete) demand.deleteDate = null;
    else demand.deleteDate = new Date();
    this.updateDemand$ = this.demandService.updateDemand(demand.id, {
      isOn: isDelete ? '2' : '1',
    }).subscribe(res => {
      if (res.success) {
        this.message.success('归档需求成功');
        this.getDemandList();
      } else {
        this.message.error('归档需求失败');
      }
    });
  }

  public editDemand(id: number) {
    this.activeDemandId = id;
    this.demandEditorVisible = true;
  }

  public changeDemandEditorModal(visible: boolean) {
    this.demandEditorVisible = visible;
    this.activeDemandId = null;
    this.getDemandTypeList();
  }

  @HasPermission(PermissionEnum.createDemand)
  public addDemand() {
    this.demandCreatorVisible = true;
  }

  public passDemand(id: number) {
    if (this.passDemand$) this.passDemand$.unsubscribe();
    this.passDemand$ = this.demandService.passDemand(id).subscribe(res => {
      if (res.success) {
        this.message.success('审核需求成功');
        this.getDemandList();
      } else {
        this.message.error('审核需求失败');
      }
    });
  }

  public openLog(id: number) {
    this.activeLogDemandId = id;
    this.demandLogVisible = true;
  }

  public changeDemandLogModal(visible: boolean) {
    this.demandLogVisible = visible;
    this.activeLogDemandId = null;
  }

  public exportExcel() {
    let excelExportUrl = `${this.rootUrl}/api/demand/download?`;
    const searchData = this.buildSearch();
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
