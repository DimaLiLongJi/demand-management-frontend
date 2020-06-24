import { DemandTypeDetail, DemandStatusDetail } from '.';

export interface DemandTypeStatusIndex {
  id?: number;
  index: number;
  demandType: number;
  demandStatus: number;
}

export class DemandTypeStatusIndexDetail {
  public id?: number;
  public index: number;
  public demandType: DemandTypeDetail;
  public demandStatus: DemandStatusDetail;
}

