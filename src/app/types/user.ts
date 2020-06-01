import { PermissionDetail } from './premission';
import { RoleDetail } from './role';

export class User {
  public id?: number;
  public name: string;
  public mobile: string;
  public email: string;
  public salt?: string;
  public password?: string;
  public role?: number;
  public creator?: number;
  public permissionIds?: number[];
  public permissionList?: PermissionDetail[];
  public createDate?: Date;
  public updateDate?: Date;
  public deleteDate?: Date;
}

export class UserDetail {
  public id?: number;
  public name: string;
  public mobile: string;
  public email: string;
  public salt?: string;
  public password?: string;
  public role?: RoleDetail;
  public creator?: User;
  public permissionIds?: number[];
  public permissionList?: PermissionDetail[];
  public createDate?: Date;
  public updateDate?: Date;
  public deleteDate?: Date;
}
