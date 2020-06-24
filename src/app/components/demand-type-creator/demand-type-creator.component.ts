import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DemandTypeService } from '@/service/demand-type.service';
import { DemandStatusService } from '@/service/demand-status.service';
import { DemandTypeStatusIndexService } from '@/service/demand-type-stataus-index.service';
import { NzNotificationService, NzMessageService } from 'ng-zorro-antd';
import { Subscription } from 'rxjs';
import { DemandStatusDetail, UserDetail, DemandTypeStatusIndex } from '@/types';
import { UserService } from '@/service/user.service';

@Component({
  selector: 'app-demand-type-creator',
  templateUrl: './demand-type-creator.component.html',
})
export class DemandTypeCreatorComponent implements OnInit, OnDestroy {
  @Input() public demandTypeId: number;
  @Input() public modalVisible = false;
  @Output() private changeModal = new EventEmitter<boolean>();

  public isOkLoading = false;

  // 整个类型表单
  public validateForm: FormGroup;
  private statusFormIndex = 0;
  // 筛选需求状态列表
  public statusFormNameList: (number | string)[] = [];
  // 需求类别名称和需求类型id map
  public statusFormNameStatusIdMap: {
    [key: number]: number;
  } = {};

  // 审核人表单
  public userForm: FormGroup;
  // 激活的状态
  public activeStatusId: number;
  // 状态和审核人 map
  public statusIdApproverMap: {
    [key: number]: number[]
  } = {};

  private createDemandType$: Subscription;
  private updateDemandType$: Subscription;
  private getDemandTypeById$: Subscription;
  public getDemandStatusList$: Subscription;
  public getUserList$: Subscription;
  public createByDemandTypeId$: Subscription;
  public getDemandTypeStatusIndex$: Subscription;

  public modalTitle = '新增需求类型';
  public demandStatusList: DemandStatusDetail[];


  public approverVisible = false;
  public userList: UserDetail[] = [];

  constructor(
    private userService: UserService,
    private demandTypeService: DemandTypeService,
    private demandStatusService: DemandStatusService,
    private notification: NzNotificationService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private demandTypeStatusIndexService: DemandTypeStatusIndexService,
  ) { }

  public ngOnInit() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
    });
    this.userForm = this.fb.group({});
    this.getDemandStatusList();
    this.getUserList();
  }

  public ngOnDestroy() {
    if (this.getUserList$) this.getUserList$.unsubscribe();
    if (this.createDemandType$) this.createDemandType$.unsubscribe();
    if (this.updateDemandType$) this.updateDemandType$.unsubscribe();
    if (this.getDemandTypeById$) this.getDemandTypeById$.unsubscribe();
    if (this.getDemandStatusList$) this.getDemandStatusList$.unsubscribe();
    if (this.createByDemandTypeId$) this.createByDemandTypeId$.unsubscribe();
    if (this.getDemandTypeStatusIndex$) this.getDemandTypeStatusIndex$.unsubscribe();
  }

  public afterOpen() {
    if (this.demandTypeId) {
      this.modalTitle = '编辑需求类型';
      this.getDemandTypeById(this.demandTypeId);
    } else {
      this.modalTitle = '新增需求类型';
      this.validateForm.controls['name'].setValue(null);
      this.validateForm.controls['name'].setValidators([Validators.required]);
    }
    this.cleanStatusFormControl();
  }

  /**
   * 关闭modal之后清除掉
   *
   * @memberof DemandTypeCreatorComponent
   */
  public afterClose() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
    });
    this.userForm = this.fb.group({});

    this.statusIdApproverMap = {};
    this.statusFormNameList = [];
    this.statusFormNameStatusIdMap = {};
  }

  public getDemandTypeById(id: number) {
    if (this.getDemandTypeById$) this.getDemandTypeById$.unsubscribe();
    this.getDemandTypeById$ = this.demandTypeService.getById(id).subscribe(res => {
      if (res.success) {
        let ids = res.data.demandStatusList ? res.data.demandStatusList.map(demandStatus => demandStatus.id) : [];

        this.validateForm.controls['name'].setValue(res.data.name);
        this.validateForm.controls['name'].setValidators([Validators.required]);

        if (this.getDemandTypeStatusIndex$) this.getDemandTypeStatusIndex$.unsubscribe();
        this.getDemandTypeStatusIndex$ = this.demandTypeStatusIndexService.getByDemandTypeId(res.data.id).subscribe((res2) => {
          if (res2.data && res2.data.length > 0 && this.demandStatusList && this.demandStatusList.length > 0) {
            ids = [...ids.sort((a, b) => {
              return res2.data.find(da => da.demandStatus.id === a).index - res2.data.find(da => da.demandStatus.id === b).index;
            })];
          }
          this.addStatusFormControl(ids);
          this.addApproverFormControl(res.data.approverList);
        });
      } else {
        this.message.error('获取需求类型详情失败');
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
      this.notification.error('失败', `${this.demandTypeId ? '修改' : '创建'}需求类型失败，请检查表单信息`, {
        nzDuration: 2000,
      });
      return;
    }
    this.isOkLoading = true;
    const ids: number[] = this.statusFormNameList.map((name: string) => this.validateForm.value[`demand_status_id_${name}`]);
    const approverList: { demandStatusId: number,  approvers: number[] }[] = [];
    for (const statusId in this.statusIdApproverMap) {
      const find = approverList.find(approver => approver.demandStatusId === Number(statusId));
      if (!find) {
        approverList.push({
          demandStatusId: Number(statusId),
          approvers: this.statusIdApproverMap[statusId]
        });
      } else find.approvers = [...find.approvers, ...this.statusIdApproverMap[statusId]];
    }
    return {
      name: this.validateForm.value['name'],
      demandStatusIds: Array.from(new Set(ids)),
      approverList,
    };
  }

  private buildIndexParams(typeId: number): DemandTypeStatusIndex[] {
    return this.statusFormNameList.map((name: string, index) => {
      return {
        demandStatus: this.validateForm.value[`demand_status_id_${name}`],
        demandType: typeId,
        index,
      };
    });
  }

  public handleOnOk() {
    if (this.demandTypeId) this.updateDemandType();
    else this.addDemandType();
  }

  public addDemandType() {
    const params = this.buildParams();
    if (!params) return;

    if (this.createDemandType$) this.createDemandType$.unsubscribe();
    this.createDemandType$ = this.demandTypeService.createDemandType(params).subscribe(res => {
      this.isOkLoading = false;
      if (res.success) {
        if (this.createByDemandTypeId$) this.createByDemandTypeId$.unsubscribe();
        const demandTypeId = res.data.id;
        this.createByDemandTypeId$ = this.demandTypeStatusIndexService.createByDemandTypeId(demandTypeId, this.buildIndexParams(demandTypeId)).subscribe(() => {});
        this.changeModal.emit(false);
        this.validateForm.reset();
        this.notification.success('成功', '创建需求类型成功', {
          nzDuration: 2000,
        });
      } else {
        this.notification.error('失败', `创建需求类型失败，原因：${res.message}`, {
          nzDuration: 2000,
        });
      }
    });
  }

  public updateDemandType() {
    const params = this.buildParams();
    if (!params) return;

    if (this.updateDemandType$) this.updateDemandType$.unsubscribe();
    this.updateDemandType$ = this.demandTypeService.updateDemandType(this.demandTypeId, params).subscribe(res => {
      this.isOkLoading = false;
      if (res.success) {
        if (this.createByDemandTypeId$) this.createByDemandTypeId$.unsubscribe();
        this.createByDemandTypeId$ = this.demandTypeStatusIndexService.createByDemandTypeId(this.demandTypeId, this.buildIndexParams(this.demandTypeId)).subscribe(() => {});
        this.changeModal.emit(false);
        this.validateForm.reset();
        this.notification.success('成功', '更新需求类型成功', {
          nzDuration: 2000,
        });
      } else {
        this.notification.error('失败', `更新需求类型失败，原因：${res.message}`, {
          nzDuration: 2000,
        });
      }
    });
  }

  public addStatus(insertName?: string) {
    // 用uuid来访问
    const newName = String(++ this.statusFormIndex);

    let newStatusId: number = null;
    this.demandStatusList.forEach(status => {
      if (!this.canDisabled(status, newName)) newStatusId = status.id;
    });

    if (!newStatusId) {
      this.notification.error('失败', '无可添加的新状态', {
        nzDuration: 2000,
      });
      return;
    }

    const findIndex = this.statusFormNameList.findIndex(id => id === insertName);

    if (findIndex !== -1) this.statusFormNameList.splice(findIndex + 1, 0, newName);
    else this.statusFormNameList.push(newName);

    if (!this.validateForm.contains(`demand_status_id_${newName}`)) {
      const formControl = new FormControl([newStatusId, Validators.required]);
      formControl.setValue(newStatusId);
      this.validateForm.addControl(`demand_status_id_${newName}`, formControl);
    } else {
      this.validateForm.controls[`demand_status_id_${newName}`].setValue(newStatusId);
    }
    this.statusFormNameStatusIdMap[newName] = newStatusId;
  }

  /**
   * 添加审核人
   *
   * @param {string} name
   * @memberof DemandTypeCreatorComponent
   */
  public editApprover(name: string) {
    // 没有该项目的FormGroup则添加
    if (!this.userForm.contains(`approverIds_${this.statusFormNameStatusIdMap[name]}`)) {
      const formControl = new FormControl([null, Validators.required]);
      formControl.setValue(null);
      this.userForm.addControl(`approverIds_${this.statusFormNameStatusIdMap[name]}`, formControl);
    }

    this.approverVisible = true;
    this.activeStatusId = this.statusFormNameStatusIdMap[name];
  }

  public deleteStatus(name: string) {
    const findIndex = this.statusFormNameList.findIndex(findName => findName === name);
    if (findIndex !== -1) {
      this.validateForm.removeControl(`demand_status_id_${name}`);
      this.userForm.removeControl(`approverIds_${this.statusFormNameStatusIdMap[name]}`);
      // 先删除状态和审核人map
      delete this.statusIdApproverMap[this.statusFormNameStatusIdMap[name]];
      this.statusFormNameList.splice(findIndex, 1);
      delete this.statusFormNameStatusIdMap[name];
    }
  }

  private getDemandStatusList() {
    if (this.getDemandStatusList$) this.getDemandStatusList$.unsubscribe();
    this.getDemandStatusList$ = this.demandStatusService.getDemandStatusList().subscribe(res => {
      if (res.success) this.demandStatusList = res.data[0];
      else this.message.error('搜索需求状态列表失败');
    });
  }

  private cleanStatusFormControl() {
    this.statusFormNameList.forEach(name => {
      this.validateForm.removeControl(`demand_status_id_${name}`);
    });
    this.statusFormNameList = [];
    this.statusFormNameStatusIdMap = {};
    this.validateForm.reset();

    for (const statusId in this.statusIdApproverMap) {
      this.userForm.removeControl(`approverIds_${this.statusIdApproverMap[statusId]}`);
    }
    this.statusIdApproverMap = {};
  }

  private addApproverFormControl(approverList: { demandStatusId: number,  approvers: number[] }[]) {
    if (!approverList || approverList.length === 0) return;
    approverList.forEach(a => {
      if (!this.userForm.contains(`approverIds_${a.demandStatusId}`)) {
        const formControl = new FormControl([a.approvers, Validators.required]);
        formControl.setValue(a.approvers);
        this.userForm.addControl(`approverIds_${a.demandStatusId}`, formControl);
      } else {
        this.userForm.controls[`approverIds_${a.demandStatusId}`].setValue(a.approvers);
      }
      this.statusIdApproverMap[a.demandStatusId] = a.approvers;
    });
  }

  private addStatusFormControl(ids: number[]) {
    ids.forEach(statusId => {
      const newName = String(++ this.statusFormIndex);
      if (!this.validateForm.contains(`demand_status_id_${newName}`)) {
        const formControl = new FormControl([statusId, Validators.required]);
        formControl.setValue(statusId);
        this.validateForm.addControl(`demand_status_id_${newName}`, formControl);
        this.statusFormNameList.push(newName);
        this.statusFormNameStatusIdMap[newName] = statusId;
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

  public handleApproverCancel() {
    this.approverVisible = false;
    this.activeStatusId = null;
  }

  public handleApproverOk() {
    this.approverVisible = false;
    this.statusIdApproverMap[this.activeStatusId] = this.userForm.value[`approverIds_${this.activeStatusId}`];
    this.activeStatusId = null;
  }

  public statusCanActive(demandStatus: DemandStatusDetail): boolean {
    if (!demandStatus.deleteDate && this.statusFormNameList.indexOf(demandStatus.id) !== -1) return true;
    return false;
  }

  public demandStatusChange(formName: string, statusId: number) {
    this.statusFormNameStatusIdMap[formName] = statusId;
  }

  public canDisabled(demandStatus: DemandStatusDetail, formName: string) {
    if (demandStatus.deleteDate) return true;
    let result = false;
    for (const name in this.statusFormNameStatusIdMap) {
      if (name !== formName && this.statusFormNameStatusIdMap[name] === demandStatus.id) result = true;
    }
    return result;
  }
}
