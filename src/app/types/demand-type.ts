import { User } from './user';
import { DemandStatusDetail } from './demand-status';

export class DemandType {
  public id?: number;
  public name?: string;
  public creator?: number;
  public demandStatusIds?: number[];
  public createDate?: Date;
  public updateDate?: Date;
  public deleteDate?: Date;
  public approverList?: { demandStatusId: number,  approvers: number[] }[];
}

export class DemandTypeDetail {
  public id?: number;
  public name?: string;
  public creator?: User;
  public demandStatusList?: DemandStatusDetail[];
  public createDate?: Date;
  public updateDate?: Date;
  public deleteDate?: Date;
  public approverList?: Array<{ demandStatusId: number,  approvers: number[] }>;
}
