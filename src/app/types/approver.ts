import { DemandTypeDetail, DemandStatusDetail, User } from './';

export class ApproverDetail {
  public id: number;
  public demandType?: DemandTypeDetail;
  public demandStatus?: DemandStatusDetail;
  public user?: User;
}
