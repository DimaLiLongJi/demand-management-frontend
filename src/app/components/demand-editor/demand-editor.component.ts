import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DemandTypeDetail, UserDetail, DemandStatusDetail, DemandProgressDetail, PermissionEnum, PermissionDetail, File, IResponse, DemandDetail, DemandPending } from '@/types';
import { DemandService } from '@/service/demand.service';
import { AuthService } from '@/service/auth.service';
import { UserService } from '@/service/user.service';
import { PermissionControllerService } from '@/service/permission-controller.service';
import { DemandTypeService } from '@/service/demand-type.service';
import { DemandProgressService } from '@/service/demand-progress.service';
import { DemandNodeService } from '@/service/demond-node.service';
import { ApproverService } from '@/service/approver.service';
import { ApproverDetail } from '@/types/approver';
import { NzNotificationService, NzMessageService, UploadChangeParam, UploadFile, NzModalService } from 'ng-zorro-antd';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL } from '@/service/environment.service';

interface INodeType {
  id: number;
  checked: boolean;
  detail: string;
  editValue: string;
  isEditing: boolean;
  isChanging: boolean;
}

interface IProgressType {
  id: number;
  label: string;
  checked?: boolean;
  userId: number;
  scheduleDate: Date[];
  isAdding: boolean;
  addValue: string;
  demandNodeList?: INodeType[];
}

@Component({
  selector: 'app-demand-editor',
  templateUrl: './demand-editor.component.html',
})
export class DemandEditorComponent implements OnInit, OnDestroy {
  @Input() public demandId: number;
  @Input() public modalVisible = false;
  @Output() private changeModal = new EventEmitter<boolean>();
  public validateForm: FormGroup;

  private getUserList$: Subscription;
  private getDemandTypeList$: Subscription;
  private getById$: Subscription;
  private updateDemand$: Subscription;
  private updateDemandProgress$: Subscription;
  private getDemandProgress$: Subscription;
  private createDemandNode$: Subscription;
  private updateDemandNode$: Subscription;

  public userList: UserDetail[];
  public demandTypeList: DemandTypeDetail[];
  public demandStatusList: DemandStatusDetail[];
  public demandCreatorId: number;

  public proposerList: number[] = [];
  public brokerList: number[] = [];
  public developerList: number[] = [];
  public devopsList: number[] = [];

  public developerProgress: IProgressType[] = [];
  public devopsProgress: IProgressType[] = [];

  private selfPermissionList: PermissionDetail[] = [];

  public changeControll = {
    name: false,
    expectDate: false,
    demandType: false,
    demandStatus: false,
    proposerIds: false,
    brokerIds: false,
    developerIds: false,
    devopsIds: false,
    manDay: false,
    detail: false,
    comment: false,
    url: false,
    scheduleStartDate: false,
    scheduleEndDate: false,
  };

  private scheduleStartDate: Date = null;
  private scheduleEndDate: Date = null;

  public uploadFileList: {
    uid: number,      // 文件唯一标识
    name: string,   // 文件名
    status: 'done' | 'uploading' | 'error' | 'removed', // 状态有：uploading done error removed
    response?: IResponse<File>, // 服务端响应内容
    url: string, // 下载链接额外的 HTML 属性
  }[] = [];

  public fileIds: number[] = [];

  public getApproverList$: Subscription;
  private approverList: ApproverDetail[] = [];
  public demandDetail: DemandDetail;

  constructor(
    private approverService: ApproverService,
    private authService: AuthService,
    private permissionControllerService: PermissionControllerService,
    private demandTypeService: DemandTypeService,
    private demandProgressService: DemandProgressService,
    private demandNodeService: DemandNodeService,
    private demandService: DemandService,
    private userService: UserService,
    private notification: NzNotificationService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private modalService: NzModalService,
    @Inject(API_URL) public rootUrl: string,
  ) {
    this.permissionControllerService.hasPermission(null, (permissionList) => {
      this.selfPermissionList = permissionList;
    });
  }

  public ngOnInit() {
    this.getApproverList();
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
    this.validateForm.disable();
    this.uploadFileList = [];
    this.fileIds = [];
  }

  public ngOnDestroy() {
    if (this.getUserList$) this.getUserList$.unsubscribe();
    if (this.getDemandTypeList$) this.getDemandTypeList$.unsubscribe();
    if (this.getById$) this.getById$.unsubscribe();
    if (this.updateDemand$) this.updateDemand$.unsubscribe();
    if (this.updateDemandProgress$) this.updateDemandProgress$.unsubscribe();
    if (this.getDemandProgress$) this.getDemandProgress$.unsubscribe();
    if (this.createDemandNode$) this.createDemandNode$.unsubscribe();
    if (this.updateDemandNode$) this.updateDemandNode$.unsubscribe();
    if (this.getApproverList$) this.getApproverList$.unsubscribe();
  }

  public afterOpen() {
    this.uploadFileList = [];
    this.fileIds = [];
    this.validateForm.disable();
    this.getUserList();
    this.getDemandTypeList();
    this.getById(this.demandId);
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
    this.validateForm.reset();
    this.uploadFileList = [];
    this.fileIds = [];
    this.getUserList();
    this.getDemandTypeList();
    this.changeControll = {
      name: false,
      expectDate: false,
      demandType: false,
      demandStatus: false,
      proposerIds: false,
      brokerIds: false,
      developerIds: false,
      devopsIds: false,
      manDay: false,
      detail: false,
      comment: false,
      url: false,
      scheduleStartDate: false,
      scheduleEndDate: false,
    };
  }

  private getApproverList() {
    if (this.getApproverList$) this.getApproverList$.unsubscribe();
    this.getApproverList$ = this.approverService.getAll().subscribe(res => {
      if (res.success) this.approverList = res.data;
      else this.message.error('获取审核人列表失败');
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

  public buildProgressList(demandProgressList: DemandProgressDetail[]) {
    const developerProgress: IProgressType[] = [];
    const devopsProgress: IProgressType[] = [];
    demandProgressList.forEach(progress => {
      const scheduleDate = new Array(2);
      if (progress.scheduleStartDate) scheduleDate[0] = new Date(progress.scheduleStartDate);
      if (progress.scheduleEndDate) scheduleDate[1] = new Date(progress.scheduleEndDate);
      if (progress.type === '1') {
        developerProgress.push({
          id: progress.id,
          label: progress.user.name,
          userId: progress.user.id,
          checked: !!progress.finishDate,
          scheduleDate,
          isAdding: false,
          addValue: null,
          demandNodeList: progress.demandNodeList.map(demandNode => {
            return {
              id: demandNode.id,
              checked: Boolean(demandNode.finishDate),
              isEditing: false,
              detail: demandNode.detail,
              editValue: demandNode.detail,
              isChanging: false,
            };
          }),
        });
      }
      if (progress.type === '2') {
        devopsProgress.push({
          id: progress.id,
          label: progress.user.name,
          userId: progress.user.id,
          checked: !!progress.finishDate,
          scheduleDate,
          isAdding: false,
          addValue: null,
          demandNodeList: progress.demandNodeList.map(demandNode => {
            return {
              id: demandNode.id,
              checked: Boolean(demandNode.finishDate),
              isEditing: false,
              detail: demandNode.detail,
              editValue: demandNode.detail,
              isChanging: false,
            };
          }),
        });
      }
    });
    this.developerProgress = developerProgress;
    this.devopsProgress = devopsProgress;
  }

  public getById(id: number) {
    if (this.getById$) this.getById$.unsubscribe();
    this.getById$ = this.demandService.getById(id).subscribe(res => {
      if (!res.success) {
        this.notification.error('获取需求信息失败', res.message, {
          nzDuration: 4000,
        });
        return;
      }
      this.demandDetail = res.data;
      const data = res.data;
      if (data.demandProgressList) this.buildProgressList(data.demandProgressList);

      this.demandCreatorId = data.creator.id;
      this.proposerList = data.proposerList ? data.proposerList.map(info => info.id) : [];
      this.brokerList = data.brokerList ? data.brokerList.map(info => info.id) : [];
      this.developerList = data.developerList ? data.developerList.map(info => info.id) : [];
      this.devopsList = data.devopsList ? data.devopsList.map(info => info.id) : [];

      this.uploadFileList = data.fileList ? data.fileList.map(file => {
        return {
          uid: file.id,
          name: file.name,
          status: 'done',
          url: `${this.rootUrl}/static/${file.name}`,
        };
      }) : [];

      this.scheduleStartDate = data.scheduleStartDate ? new Date(data.scheduleStartDate) : null;
      this.scheduleEndDate = data.scheduleEndDate ? new Date(data.scheduleEndDate) : null;

      this.validateForm.setValue({
        name: data.name,
        expectDate: data.expectDate ? new Date(data.expectDate) : null,
        demandType: data.demandType.id,
        demandStatus: data.demandStatus.id,
        proposerIds: this.proposerList,
        brokerIds: this.brokerList,
        developerIds: this.developerList,
        devopsIds: this.devopsList,
        manDay: data.manDay,
        detail: data.detail,
        comment: data.comment,
        url: data.url,
        scheduleStartDate: this.scheduleStartDate,
        scheduleEndDate: this.scheduleEndDate,
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
    });
  }

  private changeData(type: string) {
    this.changeControll[type] = true;
    this.validateForm.controls[type].enable();
    if (type === 'demandType') {
      this.changeControll['demandStatus'] = true;
      this.validateForm.controls['demandStatus'].enable();
    }
  }

  /**
   * 1. 创建者拥有全部权限
   * 2. 需求人 对接人 开发者和运维或其他可以改自己的选项
   * 3. 最后如果有修改权限的才能改
   *
   */
  public change(type: string) {
    // 创建者拥有全部权限
    if (this.demandCreatorId === this.authService.self.id) this.changeData(type);
    // 需求人 对接人 开发者和运维或其他可以改自己的选项
    else if (type === 'proposerIds' && this.proposerList.indexOf(this.authService.self.id) !== -1) this.changeData(type);
    else if (type === 'brokerIds' && this.brokerList.indexOf(this.authService.self.id) !== -1) this.changeData(type);
    else if (type === 'developerIds' && this.developerList.indexOf(this.authService.self.id) !== -1) this.changeData(type);
    else if (type === 'devopsIds' && this.devopsList.indexOf(this.authService.self.id) !== -1) this.changeData(type);
    else if (type === 'demandStatus') {
      this.permissionControllerService.hasPermission(
        [PermissionEnum.updateDemandStatus, PermissionEnum.updateDemand],
        () => this.changeData(type),
        () => {
          this.notification.error('失败', `你没有【${PermissionEnum.updateDemandStatus}】或【${PermissionEnum.updateDemand}】权限，请联系管理员`, {
            nzDuration: 3000,
          });
        }
      );
    } else {
      // 最后如果有修改权限的才能改
      this.permissionControllerService.hasPermission(
        [PermissionEnum.updateDemand],
        () => this.changeData(type),
        () => {
          this.notification.error('失败', `你没有【${PermissionEnum.updateDemand}】权限，请联系管理员`, {
            nzDuration: 3000,
          });
        }
      );
    }
  }

  public confirm(type: string) {
    if (type === 'demandStatus') {
      const approvers: string[] = [];
      this.approverList.forEach(ap => {
        // this.validateForm.controls['demandType'].value 是值
        // this.validateForm.value['demandType'] 得是 this.validateForm.controls['demandType'].enable();才能用
        if (ap.demandType && ap.demandType.id ===  this.validateForm.controls['demandType'].value && ap.demandStatus && ap.demandStatus.id === this.validateForm.value['demandStatus'] && ap.user) {
          approvers.push(ap.user.name);
        }
      });
      if (approvers.length > 0) {
        if (this.demandDetail.isPending === DemandPending.isPending) {
          this.notification.error('失败', `请先让该【${approvers.toString()}】审核改需求后才可更改状态！`, {
            nzDuration: 3000,
          });
          this.changeControll[type] = false;
          this.validateForm.controls[type].disable();
          this.validateForm.controls[type].setValue(this.demandDetail.demandStatus.id);
          return;
        }
        this.modalService.confirm({
          nzTitle: '提交审核',
          nzContent: `该修改将提交给【${approvers.toString()}】审核`,
          nzOnOk: () => this.changeDemandDetail(type),
        });
      } else {
        this.changeDemandDetail(type);
      }
    } else {
      this.changeDemandDetail(type);
    }
  }

  public changeDemandDetail(type: string) {
    if (this.updateDemand$) this.updateDemand$.unsubscribe();
    this.validateForm.controls[type].markAsDirty();
    this.validateForm.controls[type].updateValueAndValidity();
    const params = { [type]: this.validateForm.value[type], };
    // 修改需求类型时也要修改需求状态
    if (type === 'demandType') {
      this.validateForm.controls['demandStatus'].markAsDirty();
      this.validateForm.controls['demandStatus'].updateValueAndValidity();
      params.demandStatus = this.validateForm.value['demandStatus'];
    }
    this.updateDemand$ = this.demandService.updateDemand(this.demandId, params).subscribe(res => {
      if (res.success) {
        this.changeControll[type] = false;
        this.validateForm.controls[type].disable();
        // 修改需求类型时也要修改需求状态
        if (type === 'demandType') {
          this.changeControll['demandStatus'] = false;
          this.validateForm.controls['demandStatus'].disable();
        }
        this.getById(this.demandId);
        this.notification.success('成功', '更新需求成功', {
          nzDuration: 2000,
        });
      }
    });
  }

  // public confirmProgress(pro: IProgressType, checked: boolean) {
  public confirmProgress(pro: IProgressType) {
    if (this.updateDemandProgress$) this.updateDemandProgress$.unsubscribe();
    this.updateDemandProgress$ = this.demandProgressService.update(pro.id, { finished: pro.checked ? '1' : '2' }).subscribe(res => {
      if (res.success) this.getById(this.demandId);
      else this.message.error('更新进度失败');
    });
  }

  public canDisabled(userId: number, deleteDate?: Date, belongUserId?: number): boolean {
    if (deleteDate) return true;
    if (this.demandCreatorId === this.authService.self.id) return false;
    if (belongUserId === this.authService.self.id) return false;
    if (userId === this.authService.self.id) return false;
    if (this.selfPermissionList.find(permission => permission.operating === PermissionEnum.updateDemand)) return true;
    return true;
  }

  public canUplpadDisabled(): boolean {
    if (this.demandCreatorId === this.authService.self.id) return false;
    if (this.selfPermissionList.find(permission => permission.operating === PermissionEnum.updateDemand)) return true;
    return true;
  }

  public progressScheduleDateChange(dates: Date[], id: number) {
    if (this.updateDemandProgress$) this.updateDemandProgress$.unsubscribe();
    this.updateDemandProgress$ = this.demandProgressService.update(id, {
      scheduleStartDate: dates[0] || null,
      scheduleEndDate: dates[1] || null,
    }).subscribe(res => {
      if (res.success) this.getById(this.demandId);
      else this.message.error('更新进度失败');
    });
  }

  public upload(param: UploadChangeParam) {
    if (param.type === 'success') {
      const file: File = param.file.response.data;
      const findFile = this.uploadFileList.find(uploadFile => uploadFile.response && uploadFile.response.data && uploadFile.response.data.id === file.id);
      if (findFile) {
        findFile.url = `${this.rootUrl}/static/${file.name}`;
        findFile.uid = file.id;
      }
      if (!this.fileIds.find(id => file.id === id)) this.fileIds.push(file.id);
    }
    if (param.type === 'removed') {
      const file: File = param.file.response ? param.file.response.data : param.file;
      if (this.fileIds.find(id => file.id === id)) this.fileIds = [...this.fileIds.filter(id => file.id !== id)];
    }
  }

  public removeFile = (file: UploadFile): boolean | Observable<boolean> => {
    if (this.demandCreatorId !== this.authService.self.id && !this.selfPermissionList.find(permission => permission.operating === PermissionEnum.updateDemand)) {
      this.notification.error('失败', `你没有【${PermissionEnum.updateDemand}】权限，请联系管理员`, {
        nzDuration: 3000,
      });
      return false;
    }
    if (file.status === 'removed') {
      return this.demandService.removeFile({
        demandId: this.demandId,
        fileId: Number(file.uid)
      }).pipe(map(res$ => res$.success));
    } else return false;
  }

  private getDemandProgress(id: number) {
    if (this.getDemandProgress$) this.getDemandProgress$.unsubscribe();
    this.getDemandProgress$ = this.demandProgressService.getById(id).subscribe(res => {
      if (res.success) {
        const progress = res.data;
        let findProgress = this.developerProgress;

        if (progress.type === '1') findProgress = this.developerProgress;
        if (res.data.type === '2') findProgress = this.devopsProgress;

        const scheduleDate = new Array(2);
        if (progress.scheduleStartDate) scheduleDate[0] = new Date(progress.scheduleStartDate);
        if (progress.scheduleEndDate) scheduleDate[1] = new Date(progress.scheduleEndDate);

        const foundIndex = findProgress.findIndex(pr => pr.id === res.data.id);
        if (foundIndex === -1) {
          findProgress.push({
            id: progress.id,
            label: progress.user.name,
            userId: progress.user.id,
            checked: !!progress.finishDate,
            scheduleDate,
            isAdding: false,
            addValue: null,
            demandNodeList: progress.demandNodeList.map(demandNode => {
              return {
                id: demandNode.id,
                checked: Boolean(demandNode.finishDate),
                isEditing: false,
                detail: demandNode.detail,
                editValue: demandNode.detail,
                isChanging: false,
              };
            }),
          });
        } else {
          findProgress[foundIndex] = {
            id: progress.id,
            label: progress.user.name,
            userId: progress.user.id,
            checked: !!progress.finishDate,
            scheduleDate,
            isAdding: false,
            addValue: null,
            demandNodeList: progress.demandNodeList.map(demandNode => {
              return {
                id: demandNode.id,
                checked: Boolean(demandNode.finishDate),
                isEditing: false,
                detail: demandNode.detail,
                editValue: demandNode.detail,
                isChanging: false,
              };
            }),
          };
        }
        findProgress = [...findProgress];
      } else this.message.error('获取进度详情失败');
    });
  }

  public createDemandNode = (progress: IProgressType) => {
    if (!progress.addValue) return;
    if (this.createDemandNode$) this.createDemandNode$.unsubscribe();
    this.createDemandNode$ = this.demandNodeService.create({
      demandProgress: progress.id,
      detail: progress.addValue,
      finished: '2'
    }).subscribe(res => {
      if (res.success) this.getDemandProgress(progress.id);
      else this.message.error('新增需求检查点失败');
    });
  }

  public clearAddNode(progress: IProgressType) {
    progress.isAdding = false;
    progress.addValue = null;
  }

  public clearDemandNode(demandNode: INodeType) {
    demandNode.isEditing = false;
    demandNode.detail = demandNode.editValue;
  }

  public confirmDemandNode(demandNode: INodeType) {
    if (!demandNode.editValue) return;
    if (this.updateDemandNode$) this.updateDemandNode$.unsubscribe();
    this.updateDemandNode$ = this.demandNodeService.update(demandNode.id, { finished: demandNode.checked ? '1' : '2'}).subscribe(res => {
      if (!res.success) this.message.error('修改需求检查点失败');
    });
  }

  public updateDemandNode(demandNode: INodeType) {
    if (!demandNode.editValue) return;
    if (this.updateDemandNode$) this.updateDemandNode$.unsubscribe();
    this.updateDemandNode$ = this.demandNodeService.update(demandNode.id, { detail: demandNode.editValue}).subscribe(res => {
      if (res.success) this.clearDemandNode(demandNode);
      else this.message.error('修改需求检查点失败');
    });
  }
}
