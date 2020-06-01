import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'permissionType'})
export class PermissionTypePipe implements PipeTransform {
  public transform(value: string): string {
    if (value === '1') return '访问权限';
    if (value === '2') return '操作权限';
  }
}
