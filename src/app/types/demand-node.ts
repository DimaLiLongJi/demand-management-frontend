import { DemandProgressDetail } from './demand-progress';
import { User } from './user';

export class DemandNode {
  public id?: number;
  public detail: string;
  public demandProgress: number;
  public creator?: number;
  public createDate?: Date;
  public finishDate?: Date;
  public deleteDate?: Date;
  public finished?: '1' | '2';
}

export class DemandNodeDetail {
  public id: number;
  public detail: string;
  public demandProgress: DemandProgressDetail;
  public creator: User;
  public createDate?: Date;
  public finishDate?: Date;
  public deleteDate?: Date;
  public finished?: '1' | '2';
}
