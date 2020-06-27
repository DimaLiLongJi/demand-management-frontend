import { DemandTypeDetail, DemandStatusDetail } from '.';

export interface DemandTypeStatusIndex {
  id?: number;
  statusIndex: number;
  demandType: number;
  demandStatus: number;
}

export class DemandTypeStatusIndexDetail {
  public id?: number;
  public statusIndex: number;
  public demandType: DemandTypeDetail;
  public demandStatus: DemandStatusDetail;
}

