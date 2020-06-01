import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'demandStatus'})
export class DemandStatusPipe implements PipeTransform {
  public transform(value: string): string {
    if (value === '1') return '非结束状态';
    if (value === '2') return '已经结束状态';
  }
}
