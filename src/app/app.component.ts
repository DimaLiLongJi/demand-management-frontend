import { Component } from '@angular/core';
import { SpinControllerService } from '@/service/spin.controller.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    public spinControllerService: SpinControllerService
  ) { }
}
