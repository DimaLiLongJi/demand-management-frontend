import { NgModule } from '@angular/core';
import { PermissionListComponent } from './permission-list.component';
import { ModuleCreatorComponent } from '@/components/module-creator/module-creator.component';
import { PermissionCreatorComponent } from '@/components/permission-creator/permission-creator.component';
import { ShareModule } from '@/module/share.module';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [
    ShareModule,
    RouterModule.forChild([
      {
        path: '',
        component: PermissionListComponent,
      }
    ])
  ],
  declarations: [
    ModuleCreatorComponent,
    PermissionCreatorComponent,
    PermissionListComponent,
  ],
})
export class PermissionListModule { }
