import { NgModule } from '@angular/core';
import { DemandTypeListComponent } from './demand-type-list.component';
import { DemandTypeCreatorComponent } from '@/components/demand-type-creator/demand-type-creator.component';
import { ShareModule } from '@/module/share.module';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [
    ShareModule,
    RouterModule.forChild([
      {
        path: '',
        component: DemandTypeListComponent,
      }
    ])
  ],
  declarations: [
    DemandTypeCreatorComponent,
    DemandTypeListComponent,
  ],
})
export class DemandTypeListModule { }
