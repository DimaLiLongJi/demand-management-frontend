import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DemandTypeDetail, File, UserDetail, DemandStatusDetail, IResponse } from '@/types';
import { DemandService } from '@/service/demand.service';
import { UserService } from '@/service/user.service';
import { DemandTypeService } from '@/service/demand-type.service';
import { NzNotificationService, NzMessageService, UploadChangeParam } from 'ng-zorro-antd';
import { Subscription } from 'rxjs';
import { API_URL } from '@/service/environment.service';

@Component({
  selector: 'app-demand-creator',
  templateUrl: './demand-creator.component.html',
})
export class DemandCreatorComponent implements OnInit, OnDestroy {
  @Input() public modalVisible = false;
  @Output() private changeModal = new EventEmitter<boolean>();
  public validateForm: FormGroup;
  public isOkLoading = false;

  private createDemand$: Subscription;
  private getUserList$: Subscription;
  private getDemandTypeList$: Subscription;

  public userList: UserDetail[];
  public demandTypeList: DemandTypeDetail[];
  public demandStatusList: DemandStatusDetail[];

  public uploadFileList: {
    uid: number,      // 文件唯一标识
    name: string,   // 文件名
    status: 'done' | 'uploading' | 'error' | 'removed', // 状态有：uploading done error removed
    response?: IResponse<File>, // 服务端响应内容
    url: string, // 下载链接额外的 HTML 属性
  }[] = [];

  public fileIds: number[] = [];

  constructor(
    private demandTypeService: DemandTypeService,
    private demandService: DemandService,
    private userService: UserService,
    private notification: NzNotificationService,
    private message: NzMessageService,
    private fb: FormBuilder,
    @Inject(API_URL) public rootUrl: string,
  ) { }

  public ngOnInit() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      expectDate: [null, [Validators.required]],
      demandType: [null, [Validators.required]],
      demandStatus: [null, [Validators.required]],
      proposerIds: [null],
      brokerIds: [null],
      developerIds: [null],
      devopsIds: [null],
      manDay: [null, [Validators.required]],
      scheduleStartDate: [null],
      scheduleEndDate: [null],
      detail: [null],
      comment: [null],
      url: [null],
    });
    this.uploadFileList = [];
    this.fileIds = [];
  }

  public ngOnDestroy() {
    if (this.getUserList$) this.getUserList$.unsubscribe();
    if (this.getDemandTypeList$) this.getDemandTypeList$.unsubscribe();
    if (this.createDemand$) this.createDemand$.unsubscribe();
  }

  public afterOpen() {
    this.getUserList();
    this.getDemandTypeList();
    this.validateForm.setValue({
      name: null,
      expectDate: null,
      demandType: null,
      demandStatus: null,
      proposerIds: null,
      brokerIds: null,
      developerIds: null,
      devopsIds: null,
      manDay: null,
      detail: null,
      comment: null,
      url: null,
      scheduleStartDate: null,
      scheduleEndDate: null,
    });
    this.validateForm.controls['name'].setValidators([Validators.required]);
    this.validateForm.controls['expectDate'].setValidators([Validators.required]);
    this.validateForm.controls['demandType'].setValidators([Validators.required]);
    this.validateForm.controls['demandStatus'].setValidators([Validators.required]);
    this.validateForm.controls['proposerIds'].setValidators(null);
    this.validateForm.controls['brokerIds'].setValidators(null);
    this.validateForm.controls['developerIds'].setValidators(null);
    this.validateForm.controls['devopsIds'].setValidators(null);
    this.validateForm.controls['manDay'].setValidators([Validators.required]);
    this.validateForm.controls['detail'].setValidators(null);
    this.validateForm.controls['comment'].setValidators(null);
    this.validateForm.controls['url'].setValidators(null);
    this.validateForm.controls['scheduleStartDate'].setValidators(null);
    this.validateForm.controls['scheduleEndDate'].setValidators(null);
    this.fileIds = [];
    this.uploadFileList = [];
    this.fileIds = [];
  }

  public afterClose() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      expectDate: [null, [Validators.required]],
      demandType: [null, [Validators.required]],
      demandStatus: [null, [Validators.required]],
      proposerIds: [null],
      brokerIds: [null],
      developerIds: [null],
      devopsIds: [null],
      manDay: [null, [Validators.required]],
      scheduleStartDate: [null],
      scheduleEndDate: [null],
      detail: [null],
      comment: [null],
      url: [null],
    });
  }

  public handleCancel() {
    this.changeModal.emit(false);
    this.isOkLoading = false;
    this.validateForm.reset();
    this.getUserList();
    this.getDemandTypeList();
    this.uploadFileList = [];
    this.fileIds = [];
  }

  public buildParams() {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (!this.validateForm.valid) {
      this.notification.error('失败', '创建需求失败，请检查表单信息', {
        nzDuration: 2000,
      });
      return;
    }
    this.isOkLoading = true;
    return {
      name: this.validateForm.value['name'],
      expectDate: this.validateForm.value['expectDate'],
      demandType: this.validateForm.value['demandType'],
      demandStatus: this.validateForm.value['demandStatus'],
      proposerIds: this.validateForm.value['proposerIds'],
      brokerIds: this.validateForm.value['brokerIds'],
      developerIds: this.validateForm.value['developerIds'],
      devopsIds: this.validateForm.value['devopsIds'],
      fileIds: [...this.fileIds],
      manDay: this.validateForm.value['manDay'],
      detail: this.validateForm.value['detail'],
      comment: this.validateForm.value['comment'],
      url: this.validateForm.value['url'],
      scheduleStartDate: this.validateForm.value['scheduleStartDate'],
      scheduleEndDate: this.validateForm.value['scheduleEndDate'],
    };
  }

  public handleOnOk() {
    this.addDemand();
  }

  public addDemand() {
    const params = this.buildParams();
    if (!params) return;

    if (this.createDemand$) this.createDemand$.unsubscribe();
    this.createDemand$ = this.demandService.createDemand(params).subscribe(res => {
      this.isOkLoading = false;
      if (res.success) {
        this.changeModal.emit(false);
        this.validateForm.reset();
        this.uploadFileList = [];
        this.fileIds = [];
        this.notification.success('成功', '创建需求成功', {
          nzDuration: 2000,
        });
      } else {
        this.notification.error('失败', `创建需求失败，原因：${res.message}`, {
          nzDuration: 2000,
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

  public getDemandTypeList() {
    if (this.getDemandTypeList$) this.getDemandTypeList$.unsubscribe();
    this.getDemandTypeList$ = this.demandTypeService.getDemandTypeList().subscribe(res => {
      if (res.success) {
        this.demandTypeList = res.data[0] || [];
        this.demandStatusList = this.demandTypeList && this.demandTypeList[0] ? this.demandTypeList[0].demandStatusList : [];
      } else this.message.error('获取信息列表失败');
    });
  }


  public demandTypeChange(id: number) {
    const demandStatus = this.demandTypeList ? this.demandTypeList.find(demandType => demandType.id === id) : null;
    this.demandStatusList = demandStatus ? demandStatus.demandStatusList : [];
    this.validateForm.controls.demandStatus.setValue(null);
  }

  public upload(param: UploadChangeParam) {
    if (param.type === 'success') {
      const file: File = param.file.response.data;
      const findFile = this.uploadFileList.find(uploadFile => uploadFile.response && uploadFile.response.data && uploadFile.response.data.id === file.id);
      if (findFile) findFile.url = `${this.rootUrl}/static/${file.name}`;
      if (!this.fileIds.find(id => file.id === id)) this.fileIds.push(file.id);
    }
    if (param.type === 'removed') {
      const file: File = param.file.response.data;
      if (this.fileIds.find(id => file.id === id)) this.fileIds = [...this.fileIds.filter(id => file.id !== id)];
    }
  }
}
