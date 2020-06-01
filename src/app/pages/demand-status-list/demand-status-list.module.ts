import { NgModule } from '@angular/core';
import { DemandStatusListComponent } from './demand-status-list.component';
import { DemandStatusCreatorComponent } from '@/components/demand-status-creator/demand-status-creator.component';
import { ShareModule } from '@/module/share.module';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [
    ShareModule,
    RouterModule.forChild([
      {
        path: '',
        component: DemandStatusListComponent,
      }
    ])
  ],
  declarations: [
    DemandStatusCreatorComponent,
    DemandStatusListComponent,
  ],
})
export class DemandStatusListModule { }
