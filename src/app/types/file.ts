import { UserDetail } from './user';

export class File {
  public id?: number;
  public name?: string;
  public creator?: UserDetail;
  public createDate?: Date;
}
