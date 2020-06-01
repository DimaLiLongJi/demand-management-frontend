import { Component, OnInit, OnDestroy } from '@angular/core';
import { DemandType, DemandTypeDetail } from '@/types';
import { DemandTypeService } from '@/service/demand-type.service';
import { Subscription } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-demand-type-list',
  templateUrl: './demand-type-list.component.html',
})
export class DemandTypeListComponent implements OnInit, OnDestroy {
  public searchData: {
    pageIndex: number,
    pageSize: number,
    isOn?: '1' | '2' | '',
  } = {
      pageIndex: 1,
      pageSize: 5,
      isOn: '',
    };
  public demandTypeList: DemandTypeDetail[] = [];
  public total = null;
  public demandTypeCreatorVisible = false;
  public activeDemandTypeId: number; // 编辑的权限ID

  public getDemandTypeList$: Subscription;
  public updateDemandType$: Subscription;

  constructor(
    private demandTypeService: DemandTypeService,
    private message: NzMessageService,
  ) { }

  public ngOnInit() {
    this.getDemandTypeList(this.searchData);
  }

  public ngOnDestroy() {
    if (this.getDemandTypeList$) this.getDemandTypeList$.unsubscribe();
    if (this.updateDemandType$) this.updateDemandType$.unsubscribe();
  }

  public async pageIndexChange(pageIndex: number) {
    this.searchData.pageIndex = pageIndex;
    this.getDemandTypeList({
      ...this.searchData,
      pageIndex,
    });
  }

  private getDemandTypeList(searchData: {
    type?: '1' | '2' | '',
    pageIndex: number,
    pageSize: number,
    isOn?: '1' | '2' | '',
  }) {
    if (this.getDemandTypeList$) this.getDemandTypeList$.unsubscribe();
    this.getDemandTypeList$ = this.demandTypeService.getDemandTypeList(searchData).subscribe(res => {
      if (res.success) {
        this.searchData = searchData;
        this.demandTypeList = res.data[0];
        this.total = res.data[1];
        this.message.success('搜索需求类型列表成功');
      } else {
        this.message.error('搜索需求类型列表失败');
      }
    });
  }

  public changeDemandTypeCreatorModal(visible: boolean) {
    this.demandTypeCreatorVisible = visible;
    this.activeDemandTypeId = null;
    this.getDemandTypeList({
      ...this.searchData,
      pageIndex: 1,
    });
  }

  public deleteDemandType(demandType: DemandType, isDelete: boolean) {
    if (this.updateDemandType$) this.updateDemandType$.unsubscribe();
    if (!isDelete) demandType.deleteDate = null;
    else demandType.deleteDate = new Date();
    this.updateDemandType$ = this.demandTypeService.updateDemandType(demandType.id, {
      isOn: isDelete ? '2' : '1',
    }).subscribe(res => {
      if (res.success) {
        this.message.success('更新需求类型成功');
        this.getDemandTypeList(this.searchData);
      } else {
        this.message.error('更新需求类型失败');
      }
    });
  }

  public editDemandType(id: number) {
    this.activeDemandTypeId = id;
    this.demandTypeCreatorVisible = true;
  }

}
