import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'demandIsPending'})
export class DemandIsPendingPipe implements PipeTransform {
  public transform(value: string): string {
    if (value === '1') return '已审核';
    if (value === '2') return '待审核';
  }
}
