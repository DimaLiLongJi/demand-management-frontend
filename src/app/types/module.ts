import { UserDetail } from './user';
import { PermissionDetail } from './premission';

export class Module {
  public id?: number;
  public name: string;
  public icon: string;
  public creator?: number;
  public createDate?: Date;
  public updateDate?: Date;
  public deleteDate?: Date;
}

export class ModuleDetail {
  public id: number;
  public name: string;
  public icon: string;
  public creator: UserDetail;
  public permissionList: PermissionDetail[];
  public createDate?: Date;
  public updateDate?: Date;
  public deleteDate?: Date;
}
