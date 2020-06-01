import { NgModule } from '@angular/core';
import { UserListComponent } from './user-list.component';
import { UserCreatorComponent } from '@/components/user-creator/user-creator.component';
import { ShareModule } from '@/module/share.module';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [
    ShareModule,
    RouterModule.forChild([
      {
        path: '',
        component: UserListComponent,
      }
    ])
  ],
  declarations: [
    UserCreatorComponent,
    UserListComponent,
  ],
})
export class UserListModule { }
