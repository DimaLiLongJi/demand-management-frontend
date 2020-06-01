import { NgModule } from '@angular/core';
import { RoleListComponent } from './role-list.component';
import { RoleCreatorComponent } from '@/components/role-creator/role-creator.component';
import { ShareModule } from '@/module/share.module';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [
    ShareModule,
    RouterModule.forChild([
      {
        path: '',
        component: RoleListComponent,
      }
    ])
  ],
  declarations: [
    RoleCreatorComponent,
    RoleListComponent,
  ],
})
export class RoleListModule { }
