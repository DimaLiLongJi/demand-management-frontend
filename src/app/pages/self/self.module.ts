import { NgModule } from '@angular/core';
import { SelfComponent } from './self.component';
import { ShareModule } from '@/module/share.module';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [
    ShareModule,
    RouterModule.forChild([
      {
        path: '',
        component: SelfComponent,
      }
    ])
  ],
  declarations: [
    SelfComponent,
  ],
})
export class SelfModule { }
