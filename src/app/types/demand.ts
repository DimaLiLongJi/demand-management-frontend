import { DemandTypeDetail } from './demand-type';
import { DemandStatusDetail } from './demand-status';
import { User } from './user';
import { DemandProgressDetail } from './demand-progress';
import { File } from './file';

export type IDemandSelfSearchType = 'approver' | 'proposer' | 'broker' | 'devops' | 'developer' | 'creator';

export type Timeout = '1' | '2' | '3' | '4';

export enum DemandPending {
  notPending = '1', // 已审核
  isPending = '2', // 待审核
}

export interface IDemandSelfSearch {
  pageIndex?: number;
  pageSize?: number;
  isOn?: '1' | '2' | '';
  keyword?: string;
  type?: IDemandSelfSearchType;
  demandType?: number | '';
  demandStatus?: number | '';
  deleteDate?: Date;
  demandCreateFromDate?: string;
  demandCreateToDate?: string;
  demandEndFromDate?: string;
  demandEndToDate?: string;
  scheduleStartFromDate?: string;
  scheduleStartToDate?: string;
  scheduleEndFromDate?: string;
  scheduleEndToDate?: string;
  userId?: number;
  timeout?: '' | Timeout;
  isPending?: DemandPending;
}

export interface IDemandSearch {
  type?: '1' | '2' | '';
  isOn?: '1' | '2' | '';
  keyword?: string;
  pageIndex?: number;
  pageSize?: number;
  creator?: number | '';
  proposer?: number | '';
  broker?: number | '';
  developer?: number | '';
  devops?: number | '';
  demandType?: number | '';
  demandStatus?: number | '';
  deleteDate?: Date;
  demandCreateFromDate?: string;
  demandCreateToDate?: string;
  demandEndFromDate?: string;
  demandEndToDate?: string;
  scheduleStartFromDate?: string;
  scheduleStartToDate?: string;
  scheduleEndFromDate?: string;
  scheduleEndToDate?: string;
  timeout?: '' | Timeout;
}

export class Demand {
  public id?: number;
  public name?: string;
  public manDay?: number;
  public detail?: string;
  public comment?: string;
  public url?: string;
  public demandType?: number;
  public demandStatus?: number;
  public creator?: number;
  public proposerIds?: number[];
  public brokerIds?: number[];
  public developerIds?: number[];
  public devopsIds?: number[];
  public fileIds?: number[];
  public expectDate?: Date;
  public scheduleStartDate?: Date;
  public scheduleEndDate?: Date;
  public finishDate?: Date;
  public createDate?: Date;
  public updateDate?: Date;
  public deleteDate?: Date;
  public isPending?: DemandPending;
  public canPass?: boolean; // 能否通过 不在数据中，是后加的
}

export class DemandDetail {
  public id?: number;
  public name?: string;
  public manDay?: number;
  public detail?: string;
  public comment?: string;
  public url?: string;
  public demandType?: DemandTypeDetail;
  public demandStatus?: DemandStatusDetail;
  public demandProgressList?: DemandProgressDetail[];
  public creator?: User;
  public proposerList?: User[];
  public brokerList?: User[];
  public developerList?: User[];
  public devopsList?: User[];
  public fileList?: File[];
  public expectDate?: Date;
  public scheduleStartDate?: Date;
  public scheduleEndDate?: Date;
  public finishDate?: Date;
  public createDate?: Date;
  public updateDate?: Date;
  public deleteDate?: Date;
  public timeout?: '' | Timeout;
  public isPending?: DemandPending;
  public canPass?: boolean; // 能否通过 不在数据中，是后加的
}
