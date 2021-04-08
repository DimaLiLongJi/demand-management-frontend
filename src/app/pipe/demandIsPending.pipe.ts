import { API_URL } from '@/service/environment.service';
import { Inject, Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'demandIsPending'})
export class DemandIsPendingPipe implements PipeTransform {
  constructor(@Inject(API_URL) public rootUrl: string,) {
  }
  public transform(value: string): string {
    console.log(231231, this.rootUrl);
    if (value === '1') return '已审核';
    if (value === '2') return '待审核';
  }
}
