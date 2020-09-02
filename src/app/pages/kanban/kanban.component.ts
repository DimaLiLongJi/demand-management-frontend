import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { DemandDetail, Demand, DemandTypeDetail, UserDetail, DemandStatusDetail, IDemandSearch, PermissionEnum, DemandPending } from '@/types';
import { DemandService } from '@/service/demand.service';
import { UserService } from '@/service/user.service';
import { Subscription } from 'rxjs';
import { NzMessageService, NzNotificationService, NzModalService } from 'ng-zorro-antd';
import { HasPermission } from '@/decorators/has-permission';
import { KanBan } from '@/types/kanban';
import { DropEvent } from 'ng-drag-drop';
import { AuthService } from '@/service/auth.service';
import { PermissionControllerService } from '@/service/permission-controller.service';
import { ApproverService } from '@/service/approver.service';
import { ApproverDetail } from '@/types/approver';
import { RoleService } from '@/service/role.service';
import { SpinControllerService } from '@/service/spin.controller.service';
import { API_URL } from '@/service/environment.service';
import { DemandTypeStatusIndexService } from '@/service/demand-type-stataus-index.service';

@Component({
  selector: 'app-kanban-list',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.style.less'],
})
export class KanbanComponent implements OnInit, OnDestroy {
  public showMore = false;
  public searchData: IDemandSearch = {
    type: '',
    isOn: '1',
    creator: '',
    proposer: '',
    broker: '',
    developer: '',
    devops: '',
    demandType: '',
    keyword: null,
    timeout: '',
  };
  public demandCreateDate: Date[] = [];
  public demandEndDate: Date[] = [];
  public scheduleStartDate: Date[] = [];
  public scheduleEndDate: Date[] = [];
  public userList: UserDetail[] = [];
  public kanbanList: KanBan[] = [];
  public demandTypeList: DemandTypeDetail[] = [];
  public canPassDemandList: number[] = [];
  public demandStatusList: DemandStatusDetail[] = [];
  public demandCreatorVisible = false;
  public getDemandList$: Subscription;
  public updateDemand$: Subscription;
  public getDemandTypeList$: Subscription;
  public getCanPassDemandList$: Subscription;
  public getUserList$: Subscription;
  public passDemand$: Subscription;
  public getDemandTypeStatusIndex$: Subscription;

  public activeDemandId: number = null;
  public demandEditorVisible = false;

  public activeLogDemandId: number = null;
  public demandLogVisible = false;

  public getApproverList$: Subscription;
  private approverList: ApproverDetail[] = [];

  constructor(
    private approverService: ApproverService,
    private demandService: DemandService,
    private roleService: RoleService,
    private userService: UserService,
    private message: NzMessageService,
    private authService: AuthService,
    private permissionControllerService: PermissionControllerService,
    private notification: NzNotificationService,
    private modalService: NzModalService,
    public spinControllerService: SpinControllerService,
    @Inject(API_URL) public rootUrl: string,
    private demandTypeStatusIndexService: DemandTypeStatusIndexService,
  ) { }

  public ngOnInit() {
    this.getApproverList();
    this.getUserList();
    // 获取完需求类型再获取列表
    this.getDemandTypeList();
  }

  public ngOnDestroy() {
    if (this.getDemandList$) this.getDemandList$.unsubscribe();
    if (this.getCanPassDemandList$) this.getCanPassDemandList$.unsubscribe();
    if (this.updateDemand$) this.updateDemand$.unsubscribe();
    if (this.getDemandTypeList$) this.getDemandTypeList$.unsubscribe();
    if (this.getUserList$) this.getUserList$.unsubscribe();
    if (this.getApproverList$) this.getApproverList$.unsubscribe();
    if (this.passDemand$) this.passDemand$.unsubscribe();
    if (this.getDemandTypeStatusIndex$) this.getDemandTypeStatusIndex$.unsubscribe();
  }

  public reset() {
    this.searchData = {
      type: '',
      isOn: '1',
      creator: '',
      proposer: '',
      broker: '',
      developer: '',
      devops: '',
      keyword: null,
      timeout: '',
    };
    if (this.demandTypeList[0]) this.searchData.demandType = this.demandTypeList[0].id;
    this.demandCreateDate = [];
    this.demandEndDate = [];
    this.scheduleStartDate = [];
    this.scheduleEndDate = [];
    // 获取完需求类型再获取列表
    this.getDemandTypeList();
  }

  private buildSearch() {
    const searchData: IDemandSearch = {
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

  private getApproverList() {
    if (this.getApproverList$) this.getApproverList$.unsubscribe();
    this.getApproverList$ = this.approverService.getAll().subscribe(res => {
      if (res.success) this.approverList = res.data;
      else this.message.error('获取审核人列表失败');
    });
  }

  public getDemandList() {
    if (this.getCanPassDemandList$) this.getCanPassDemandList$.unsubscribe();
    this.getCanPassDemandList$ = this.demandService.getSelfDemandList({ type: 'approver' }).subscribe(res1 => {
      if (res1.success) {
        this.canPassDemandList = res1.data[0] ? res1.data[0].map(demand => demand.id) : [];
        const searchData = this.buildSearch();
        if (this.getDemandList$) this.getDemandList$.unsubscribe();
        this.getDemandList$ = this.demandService.getDemandList(searchData).subscribe(res => {
          if (res.success || !res.data[0]) {
            this.searchData = searchData;
            const today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(0);
            today.setMilliseconds(0);

            this.kanbanList = this.demandStatusList.map(status => {
              return {
                statusId: status.id,
                statusName: status.name,
                demandList: []
              };
            });
            this.kanbanList.push({
              statusId: 0,
              statusName: '已归档',
              demandList: []
            });

            res.data[0].forEach(demand => {
              let timeout = null;
              const scheduleEndDate = (new Date(demand.scheduleEndDate)).getTime();
              if (demand.scheduleEndDate && today.getTime() < scheduleEndDate) timeout = '1';
              if (demand.scheduleEndDate && today.getTime() === scheduleEndDate) timeout = '2';
              if (demand.scheduleEndDate && today.getTime() > scheduleEndDate) timeout = '3';
              if (demand.finishDate) timeout = '4';

              // 删除的直接归档
              if (demand.deleteDate) {
                this.kanbanList[this.kanbanList.length - 1].demandList.push({
                  ...demand,
                  timeout,
                  canPass: (this.canPassDemandList.indexOf(demand.id) !== -1) ? true : false
                });
                return;
              }

              const findKanban = this.kanbanList.find(kanban => kanban.statusId === demand.demandStatus.id);
              if (findKanban) {
                findKanban.demandList.push({
                  ...demand,
                  timeout,
                  canPass: (this.canPassDemandList.indexOf(demand.id) !== -1) ? true : false
                });
              }
            });
            this.message.success('搜索需求看板成功');
          } else {
            this.message.error('搜索需求看板失败');
          }
        });
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

  private resetDemandTypeStatusIndex(typeId: number) {
    if (this.getDemandTypeStatusIndex$) this.getDemandTypeStatusIndex$.unsubscribe();
    this.getDemandTypeStatusIndex$ = this.demandTypeStatusIndexService.getByDemandTypeId(typeId).subscribe((res2) => {
      if (res2.data && res2.data.length > 0 && this.demandStatusList && this.demandStatusList.length > 0) {
        this.demandStatusList = [...this.demandStatusList.sort((a, b) => {
          return res2.data.find(da => da.demandStatus.id === a.id).statusIndex - res2.data.find(da => da.demandStatus.id === b.id).statusIndex;
        })];
      }
    });
  }

  public getDemandTypeList() {
    if (this.getDemandTypeList$) this.getDemandTypeList$.unsubscribe();
    this.getDemandTypeList$ = this.roleService.getById(this.authService.self.role.id).subscribe(res => {
      if (res.success) {
        this.demandTypeList = res.data.demandTypeList || [];
        this.demandStatusList = this.demandTypeList && this.demandTypeList[0] ? this.demandTypeList[0].demandStatusList : [];
        this.searchData.demandType = this.demandTypeList && this.demandTypeList[0] ? this.demandTypeList[0].id : '';
        this.resetDemandTypeStatusIndex(this.demandTypeList[0].id);
        this.getDemandList();
      } else this.message.error('获取信息列表失败');
    });
  }

  public demandTypeChange(id: number) {
    const demandStatus = this.demandTypeList ? this.demandTypeList.find(demandType => demandType.id === id) : null;
    this.demandStatusList = demandStatus ? demandStatus.demandStatusList : [];
    this.resetDemandTypeStatusIndex(id);
  }

  public changeDemandCreatorModal(visible: boolean) {
    this.demandCreatorVisible = visible;
    this.getDemandList();
  }

  public tryDeleteDemand(demand: Demand, isDelete: boolean) {
    // 创建者拥有全部权限
    if (demand.creator === this.authService.self.id) this.deleteDemand(demand, isDelete);
    else {
      this.permissionControllerService.hasPermission(
        [PermissionEnum.updateDemand],
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
    this.spinControllerService.update(true);
    if (this.updateDemand$) this.updateDemand$.unsubscribe();
    if (!isDelete) demand.deleteDate = null;
    else demand.deleteDate = new Date();
    this.updateDemand$ = this.demandService.updateDemand(demand.id, {
      isOn: isDelete ? '2' : '1',
    }).subscribe(res => {
      if (res.success) {
        this.message.success('更新权限成功');
        this.getDemandList();
      } else {
        this.message.error('更新权限失败');
      }
      this.spinControllerService.update(false);
    });
  }

  public editDemand(id: number) {

    this.activeDemandId = id;
    this.demandEditorVisible = true;
  }

  public changeDemandEditorModal(visible: boolean) {
    this.demandEditorVisible = visible;
    this.activeDemandId = null;
    this.getDemandList();
  }

  @HasPermission(PermissionEnum.createDemand)
  public addDemand() {
    this.demandCreatorVisible = true;
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
    const keys = Object.keys(searchData);
    keys.forEach(key => {
      if (!searchData[key]) return;
      excelExportUrl += `${key}=${searchData[key]}&`;
    });
    return excelExportUrl;
  }

  /**
   * 看板拖拽更新状态
   *
   * @param {DropEvent} event
   * @param {KanBan} kanban
   * @memberof KanbanComponent
   */
  public onItemDrop(event: DropEvent, kanban: KanBan) {
    const demand: DemandDetail = event.dragData;
    // 创建者拥有全部权限
    if (demand.creator.id === this.authService.self.id) this.dragDataConfirm(demand, kanban.statusId);
    else {
      // 最后如果有修改权限的才能改
      this.permissionControllerService.hasPermission(
        [PermissionEnum.updateDemandStatus, PermissionEnum.updateDemand],
        () => this.dragDataConfirm(demand, kanban.statusId),
        () => {
          this.notification.error('失败', `你没有【${PermissionEnum.updateDemandStatus}】或【${PermissionEnum.updateDemand}】权限，请联系管理员`, {
            nzDuration: 3000,
          });
        }
      );
    }
  }

  public dragDataConfirm(demand: Demand | DemandDetail, statusId: number) {
    const approvers: string[] = [];
    this.approverList.forEach(ap => {
      if (ap.demandType && ap.demandType.id === this.searchData.demandType && ap.demandStatus && ap.demandStatus.id === statusId && ap.user) {
        approvers.push(ap.user.name);
      }
    });
    if (approvers.length > 0) {
      if (demand.isPending === DemandPending.isPending) {
        this.notification.error('失败', `请先让该【${approvers.toString()}】审核改需求后才可更改状态！`, {
          nzDuration: 3000,
        });
        return;
      }
      this.modalService.confirm({
        nzTitle: '提交审核',
        nzContent: `该修改将提交给【${approvers.toString()}】审核`,
        nzOnOk: () => this.changeData(demand, statusId)
      });
    } else {
      this.changeData(demand, statusId);
    }
  }

  public changeData(demand: Demand | DemandDetail, statusId: number) {
    if (statusId === 0) {
      // 如果statusId===0 则是去归档
      this.deleteDemand(demand as Demand, true);
    } else {
      const updateParams: any = {
        demandStatus: statusId
      };
      // 如果deleteDate存在 则是先解除归档
      if (demand.deleteDate) {
        updateParams.isOn = '1';
        updateParams.deleteDate = null;
      }
      this.spinControllerService.update(true);
      if (this.updateDemand$) this.updateDemand$.unsubscribe();
      this.updateDemand$ = this.demandService.updateDemand(demand.id, updateParams).subscribe(res => {
        if (res.success) {
          this.notification.success('成功', '更新需求状态成功', {
            nzDuration: 2000,
          });
          this.getDemandList();
        } else {
          this.notification.error('失败', `更新需求状态失败`, {
            nzDuration: 3000,
          });
        }
        this.spinControllerService.update(false);
      });
    }
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

  public rejectDemand(demand: DemandDetail) {
    if (!demand.canPass) {
      this.notification.error('失败', `无法回退该需求的审核`, {
        nzDuration: 3000,
      });
      return;
    }
    const findStatusIndex = this.kanbanList.findIndex(kb => kb.statusId === demand.demandStatus.id);
    if (findStatusIndex <= 0) {
      this.notification.error('失败', `无法回退该需求的审核`, {
        nzDuration: 3000,
      });
      return;
    }
    const returnDemandStatusId = this.kanbanList[findStatusIndex - 1].statusId;
    const updateParams: any = {
      demandStatus: returnDemandStatusId
    };
    if (this.updateDemand$) this.updateDemand$.unsubscribe();
    this.updateDemand$ = this.demandService.updateDemand(demand.id, updateParams).subscribe(res => {
      if (res.success) {
          this.notification.success('成功', '更新需求状态成功', {
            nzDuration: 2000,
          });
          this.getDemandList();
        } else {
          this.notification.error('失败', `更新需求状态失败`, {
            nzDuration: 3000,
          });
        }
      this.spinControllerService.update(false);
    });
  }
}
