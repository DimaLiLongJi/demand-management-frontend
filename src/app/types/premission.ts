import { UserDetail } from './user';
import { ModuleDetail } from './module';

export class Permission {
  public id?: number;
  public name: string;
  /**
   * 权限类型 1 或 2
   * 1：访问权限，控制路由route
   * 2：操作权限控制，控制操作项operating
   */
  public type: '1' | '2';
  public route?: string;
  public operating?: string;
  public creator?: number;
  public module?: PermissionDetail | number;
  public createDate?: Date;
  public updateDate?: Date;
  public deleteDate?: Date;
}

export class PermissionDetail {
  public id?: number;
  public name: string;
  /**
   * 权限类型 1 或 2
   * 1：访问权限，控制路由route
   * 2：操作权限控制，控制操作项operating
   */
  public type: '1' | '2';
  public route?: string;
  public operating?: string;
  public creator?: UserDetail;
  public module?: ModuleDetail;
  public createDate?: Date;
  public updateDate?: Date;
  public deleteDate?: Date;
}
