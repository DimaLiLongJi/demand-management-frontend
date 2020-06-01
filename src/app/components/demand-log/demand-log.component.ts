import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { DemandLogService } from '@/service/demand-log.service';
import { NzMessageService } from 'ng-zorro-antd';
import { Subscription } from 'rxjs';
import { DemandLogDetail, propertyMap, typeMap, DemandLogProperty } from '@/types';

@Component({
  selector: 'app-demand-log',
  templateUrl: './demand-log.component.html',
})
export class DemandLogComponent implements OnInit, OnDestroy {
  @Input() public demandId: number;
  @Input() public modalVisible = false;
  @Output() private changeModal = new EventEmitter<boolean>();

  private getList$: Subscription;
  public logList: {
    date: Date,
    content: string,
  }[];

  constructor(
    private demandLogService: DemandLogService,
    private message: NzMessageService,
  ) { }

  public ngOnInit() {
    this.getList();
  }

  public ngOnDestroy() {
    this.logList = [];
  }

  public afterOpen() {
    this.getList();
  }

  public handleOnOk() {
    this.changeModal.emit(false);
  }

  public getList() {
    if (this.getList$) this.getList$.unsubscribe();
    this.demandLogService.getList({demand: this.demandId}).subscribe(res => {
      if (res.success) {
        this.logList = this.mapLog(res.data[0] || []);
      } else this.message.error('获取操作日志列表失败');
    });
  }

  public mapLog(list: DemandLogDetail[]): { date: Date, content: string }[] {
    return list.map(li => {
      if (['expectDate', 'scheduleStartDate', 'scheduleEndDate', 'finishDate', 'deleteDate'].indexOf(li.property) !== -1) {
        li.newDetail = li.newDetail ? li.newDetail.split(' ')[0] : '';
        li.oldDetail = li.oldDetail ? li.oldDetail.split(' ')[0] : '';
      }
      if (li.type === '6' && li.property === DemandLogProperty.progress) li.newDetail = li.newDetail ? li.newDetail.split(' ')[0] : '';
      let content = '';
      if (li.type === '1') content = `${li.creator.name} ${typeMap.get(li.type)}了 【${propertyMap.get(li.property)}】 【${li.newDetail || ''}】`;
      if (li.type === '2') content = `${li.creator.name} 把 【${propertyMap.get(li.property)}】 从 【${li.oldDetail || ''}】 ${typeMap.get(li.type)}成 【${li.newDetail || ''}】`;
      if (li.type === '3') content = `${li.creator.name} ${typeMap.get(li.type)}了 【${propertyMap.get(li.property)}】【${li.newDetail || ''}】`;
      if (li.type === '4') content = `${li.creator.name} ${typeMap.get(li.type)}了 【${li.newDetail || ''}】`;
      if (li.type === '5') content = `${li.creator.name} 把 【${li.newDetail || ''}】${typeMap.get(li.type)} `;
      if (li.type === '6') content = `${li.creator.name} 把 【${li.oldDetail || ''}】${typeMap.get(li.type)}成【${li.newDetail || ''}】`;
      if (li.type === '7' || li.type === '8') content = `${li.creator.name} 把 【${propertyMap.get(li.property)}】【${typeMap.get(li.type)}】 了`;
      return {
        date: new Date(li.createDate),
        content,
      };
    });
  }

}
