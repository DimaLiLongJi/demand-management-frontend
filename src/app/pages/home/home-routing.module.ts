import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { AuthGuardService } from '@/service/authguard.service';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuardService],
    canActivateChild: [AuthGuardService],
    children: [
      {
        path: 'permission-list',
        loadChildren: () => import('../permission-list/permission-list.module').then(m => m.PermissionListModule)
      },
      {
        path: 'role-list',
        loadChildren: () => import('../role-list/role-list.module').then(m => m.RoleListModule)
      },
      {
        path: 'user-list',
        loadChildren: () => import('../user-list/user-list.module').then(m => m.UserListModule)
      },
      {
        path: 'self',
        loadChildren: () => import('../self/self.module').then(m => m.SelfModule)
      },
      {
        path: 'demand-type-list',
        loadChildren: () => import('../demand-type-list/demand-type-list.module').then(m => m.DemandTypeListModule)
      },
      {
        path: 'kanban',
        loadChildren: () => import('../kanban/kanban.module').then(m => m.KanbanModule)
      },
      {
        path: 'demand-status-list',
        loadChildren: () => import('../demand-status-list/demand-status-list.module').then(m => m.DemandStatusListModule)
      },
      {
        path: 'demand-list',
        loadChildren: () => import('../demand-list/demand-list.module').then(m => m.DemandListModule)
      },
      {
        path: 'self-demand-list',
        loadChildren: () => import('../self-demand-list/self-demand-list.module').then(m => m.SelfDemandListModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
