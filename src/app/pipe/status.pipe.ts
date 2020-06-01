import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'status'})
export class StatusPipe implements PipeTransform {
  public transform(value: Date): string {
    if (value) return '已归档';
    return '未归档';
  }
}
