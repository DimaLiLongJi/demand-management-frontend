import { NgModule } from '@angular/core';
import { KanbanComponent } from './kanban.component';
import { ShareModule } from '@/module/share.module';
import { RouterModule } from '@angular/router';
import { NgDragDropModule } from 'ng-drag-drop';

@NgModule({
  imports: [
    ShareModule,
    RouterModule.forChild([
      {
        path: '',
        component: KanbanComponent,
      }
    ]),
    NgDragDropModule.forRoot(),
  ],
  declarations: [
    KanbanComponent,
  ],
})
export class KanbanModule { }
