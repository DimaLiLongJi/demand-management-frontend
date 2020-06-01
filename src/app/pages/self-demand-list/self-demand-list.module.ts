import { NgModule } from '@angular/core';
import { SelfDemandListComponent } from './self-demand-list.component';
import { ShareModule } from '@/module/share.module';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [
    ShareModule,
    RouterModule.forChild([
      {
        path: '',
        component: SelfDemandListComponent,
      }
    ])
  ],
  declarations: [
    SelfDemandListComponent,
  ],
})
export class SelfDemandListModule { }
