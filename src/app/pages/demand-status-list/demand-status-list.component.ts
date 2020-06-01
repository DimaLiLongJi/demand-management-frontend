import { Component, OnInit, OnDestroy } from '@angular/core';
import { DemandStatus, DemandStatusDetail } from '@/types';
import { DemandStatusService } from '@/service/demand-status.service';
import { Subscription } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-demand-status-list',
  templateUrl: './demand-status-list.component.html',
})
export class DemandStatusListComponent implements OnInit, OnDestroy {
  public searchData: {
    pageIndex: number,
    pageSize: number,
    isOn?: '1' | '2' | '',
  } = {
      pageIndex: 1,
      pageSize: 5,
      isOn: '',
    };
  public demandStatusList: DemandStatusDetail[] = [];
  public total = null;
  public demandStatusCreatorVisible = false;
  public activeDemandStatusId: number; // 编辑的权限ID

  public getDemandStatusList$: Subscription;
  public updateDemandStatus$: Subscription;

  constructor(
    private demandStatusService: DemandStatusService,
    private message: NzMessageService,
  ) { }

  public ngOnInit() {
    this.getDemandStatusList(this.searchData);
  }

  public ngOnDestroy() {
    if (this.getDemandStatusList$) this.getDemandStatusList$.unsubscribe();
  }

  public async pageIndexChange(pageIndex: number) {
    this.searchData.pageIndex = pageIndex;
    this.getDemandStatusList({
      ...this.searchData,
      pageIndex,
    });
  }

  private getDemandStatusList(searchData: {
    type?: '1' | '2' | '',
    pageIndex: number,
    pageSize: number,
    isOn?: '1' | '2' | '',
  }) {
    if (this.getDemandStatusList$) this.getDemandStatusList$.unsubscribe();
    this.getDemandStatusList$ = this.demandStatusService.getDemandStatusList(searchData).subscribe(res => {
      if (res.success) {
        this.searchData = searchData;
        this.demandStatusList = res.data[0];
        this.total = res.data[1];
        this.message.success('搜索需求状态列表成功');
      } else {
        this.message.error('搜索需求状态列表失败');
      }
    });
  }

  public changeDemandStatusCreatorModal(visible: boolean) {
    this.demandStatusCreatorVisible = visible;
    this.activeDemandStatusId = null;
    this.getDemandStatusList({
      ...this.searchData,
      pageIndex: 1,
    });
  }

  public deleteDemandStatus(demandStatus: DemandStatus, isDelete: boolean) {
    if (this.updateDemandStatus$) this.updateDemandStatus$.unsubscribe();
    if (!isDelete) demandStatus.deleteDate = null;
    else demandStatus.deleteDate = new Date();
    this.updateDemandStatus$ = this.demandStatusService.updateDemandStatus(demandStatus.id, {
      isOn: isDelete ? '2' : '1',
    }).subscribe(res => {
      if (res.success) {
        this.message.success('更新需求状态成功');
        this.getDemandStatusList(this.searchData);
      } else {
        this.message.error('更新需求状态失败');
      }
    });
  }

  public editDemandStatus(id: number) {
    this.activeDemandStatusId = id;
    this.demandStatusCreatorVisible = true;
  }

}
