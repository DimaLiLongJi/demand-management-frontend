import { DemandDetail } from './demand';
import { UserDetail } from './user';
import { DemandNodeDetail } from './demand-node';

export class DemandProgress {
  public id?: number;
  public demand: number;
  public user: number;
  public creator: number;
  public createDate?: Date;
  public updateDate?: Date;
  public scheduleStartDate?: Date;
  public scheduleEndDate?: Date;
  public finishDate?: Date;
  public type: '1' | '2';
}

export class DemandProgressDetail {
  public id?: number;
  public demand: DemandDetail;
  public user: UserDetail;
  public creator: UserDetail;
  public demandNodeList?: DemandNodeDetail[];
  public createDate?: Date;
  public updateDate?: Date;
  public scheduleStartDate?: Date;
  public scheduleEndDate?: Date;
  public finishDate?: Date;
  public type: '1' | '2';
}
