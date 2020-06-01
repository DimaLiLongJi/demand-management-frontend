import { User } from './user';

export class DemandStatus {
  public id?: number;
  public name?: string;
  public isEndStatus?: '1' | '2';
  public creator?: number;
  public createDate?: Date;
  public updateDate?: Date;
  public deleteDate?: Date;
}

export class DemandStatusDetail {
  public id?: number;
  public name?: string;
  public isEndStatus?: '1' | '2';
  public creator?: User;
  public createDate?: Date;
  public updateDate?: Date;
  public deleteDate?: Date;
}
