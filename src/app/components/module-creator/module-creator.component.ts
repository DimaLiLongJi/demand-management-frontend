import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModuleService } from '@/service/module.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-module-creator',
  templateUrl: './module-creator.component.html',
})
export class ModuleCreatorComponent implements OnInit, OnDestroy {
  @Input() public modalVisible = false;
  @Output() private changeModal = new EventEmitter<boolean>();
  public validateForm: FormGroup;
  public isOkLoading = false;
  private createModule$: Subscription;

  constructor(
    private moduleService: ModuleService,
    private notification: NzNotificationService,
    private fb: FormBuilder,
  ) { }

  public ngOnInit() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      icon: [null, [Validators.required]],
    });
  }

  public ngOnDestroy() {
    if (this.createModule$) this.createModule$.unsubscribe();
  }

  public handleCancel() {
    this.changeModal.emit(false);
    this.isOkLoading = false;
    this.validateForm.reset();
  }


  public afterClose() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      icon: [null, [Validators.required]],
    });
  }

  public addModule() {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    if (!this.validateForm.valid) {
      this.notification.error('失败', `创建模块失败，请检查表单信息`, {
        nzDuration: 2000,
      });
      return;
    }

    this.isOkLoading = true;
    const params = {
      name: this.validateForm.value['name'],
      icon: this.validateForm.value['icon'],
    };
    if (this.createModule$) this.createModule$.unsubscribe();
    this.createModule$ = this.moduleService.createModule(params).subscribe(res => {
      this.isOkLoading = false;
      if (res.success) {
        this.changeModal.emit(false);
        this.validateForm.reset();
        this.notification.success('成功', '创建模块成功', {
          nzDuration: 2000,
        });
      } else {
        this.notification.error('失败', `创建模块失败，原因：${res.message}`, {
          nzDuration: 2000,
        });
      }
    });
  }
}
