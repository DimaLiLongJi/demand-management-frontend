import { NgModule } from '@angular/core';
import { DemandListComponent } from './demand-list.component';
import { ShareModule } from '@/module/share.module';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [
    ShareModule,
    RouterModule.forChild([
      {
        path: '',
        component: DemandListComponent,
      }
    ])
  ],
  declarations: [
    DemandListComponent,
  ],
})
export class DemandListModule { }
