import { DemandDetail } from './demand';

export interface KanBan {
  statusId: number;
  statusName: string;
  demandList: DemandDetail[];
}
