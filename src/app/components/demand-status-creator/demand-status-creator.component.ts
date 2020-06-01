import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DemandStatusService } from '@/service/demand-status.service';
import { NzNotificationService, NzMessageService } from 'ng-zorro-antd';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-demand-status-creator',
  templateUrl: './demand-status-creator.component.html',
})
export class DemandStatusCreatorComponent implements OnInit, OnDestroy {
  @Input() public demandStatusId: number;
  @Input() public modalVisible = false;
  @Output() private changeModal = new EventEmitter<boolean>();
  public validateForm: FormGroup;
  public isOkLoading = false;

  private createDemandStatus$: Subscription;
  private updateDemandStatus$: Subscription;
  private getDemandStatusById$: Subscription;

  public modalTitle = '新增需求状态';

  constructor(
    private demandStatusService: DemandStatusService,
    private notification: NzNotificationService,
    private message: NzMessageService,
    private fb: FormBuilder,
  ) { }

  public ngOnInit() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      isEndStatus: ['1', [Validators.required]],
    });
  }

  public ngOnDestroy() {
    if (this.createDemandStatus$) this.createDemandStatus$.unsubscribe();
    if (this.updateDemandStatus$) this.updateDemandStatus$.unsubscribe();
    if (this.getDemandStatusById$) this.getDemandStatusById$.unsubscribe();
  }

  public afterOpen() {
    if (this.demandStatusId) {
      this.modalTitle = '编辑需求状态';
      this.getDemandStatusById(this.demandStatusId);
    } else {
      this.modalTitle = '新增需求状态';
      this.validateForm.setValue({
        name: null,
        isEndStatus: '1',
      });
      this.validateForm.controls['name'].setValidators([Validators.required]);
    }
  }

  public afterClose() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      isEndStatus: ['1', [Validators.required]],
    });
  }

  public getDemandStatusById(id: number) {
    if (this.getDemandStatusById$) this.getDemandStatusById$.unsubscribe();
    this.demandStatusService.getById(id).subscribe(res => {
      if (res.success) {
        this.validateForm.setValue({
          name: res.data.name,
          isEndStatus: res.data['isEndStatus'],
        });
        this.validateForm.controls['name'].setValidators([Validators.required]);
        this.validateForm.controls['isEndStatus'].setValidators([Validators.required]);
      } else {
        this.message.error('获取需求状态详情失败');
      }
    });
  }

  public handleCancel() {
    this.changeModal.emit(false);
    this.isOkLoading = false;
    this.validateForm.reset();
  }

  public buildParams() {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (!this.validateForm.valid) {
      this.notification.error('失败', `${this.demandStatusId ? '修改' : '创建'}需求状态失败，请检查表单信息`, {
        nzDuration: 2000,
      });
      return;
    }
    this.isOkLoading = true;
    return {
      name: this.validateForm.value['name'],
      isEndStatus: this.validateForm.value['isEndStatus'],
    };
  }

  public handleOnOk() {
    if (this.demandStatusId) this.updateDemandStatus();
    else this.addDemandStatus();
  }

  public addDemandStatus() {
    const params = this.buildParams();
    if (!params) return;

    if (this.createDemandStatus$) this.createDemandStatus$.unsubscribe();
    this.createDemandStatus$ = this.demandStatusService.createDemandStatus(params).subscribe(res => {
      this.isOkLoading = false;
      if (res.success) {
        this.changeModal.emit(false);
        this.validateForm.reset();
        this.notification.success('成功', '创建需求状态成功', {
          nzDuration: 2000,
        });
      } else {
        this.notification.error('失败', `创建需求状态失败，原因：${res.message}`, {
          nzDuration: 2000,
        });
      }
    });
  }

  public updateDemandStatus() {
    const params = this.buildParams();
    if (!params) return;

    if (this.updateDemandStatus$) this.updateDemandStatus$.unsubscribe();
    this.updateDemandStatus$ = this.demandStatusService.updateDemandStatus(this.demandStatusId, params).subscribe(res => {
      this.isOkLoading = false;
      if (res.success) {
        this.changeModal.emit(false);
        this.validateForm.reset();
        this.notification.success('成功', '更新需求状态成功', {
          nzDuration: 2000,
        });
      } else {
        this.notification.error('失败', `更新需求状态失败，原因：${res.message}`, {
          nzDuration: 2000,
        });
      }
    });
  }
}
