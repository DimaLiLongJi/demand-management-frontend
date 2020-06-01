import { DemandDetail } from './demand';
import { UserDetail } from './user';

export enum DemandLogType {
  create = '1',
  update = '2',
  delete = '3',
  finish = '4', // 完成需求进度
  unfinish = '5', // 未完成需求进度
  updateProgressDate = '6', // 更新进度排期
  onUpper = '7', // 未归档需求
  onLower = '8', // 归档需求
}

export enum DemandLogProperty {
  progress = 'progress',
  demand = 'demand',
  name = 'name',
  manDay = 'manDay',
  detail = 'detail',
  comment = 'comment',
  url = 'url',
  demandType = 'demandType',
  demandStatus = 'demandStatus',
  proposer = 'proposer',
  broker = 'broker',
  developer = 'developer',
  devops = 'devops',
  file = 'file',
  expectDate = 'expectDate',
  scheduleStartDate = 'scheduleStartDate',
  scheduleEndDate = 'scheduleEndDate',
  finishDate = 'finishDate',
  deleteDate = 'deleteDate',
  demandNode = 'demandNode',
  isPending = 'isPending',
}

export const propertyMap: Map<string, string> = new Map();
propertyMap.set('progress', '进度');
propertyMap.set('demand', '需求');
propertyMap.set('name', '需求名');
propertyMap.set('manDay', '需求人天');
propertyMap.set('detail', '需求详情');
propertyMap.set('comment', '审批备注');
propertyMap.set('url', '线上链接');
propertyMap.set('demandType', '需求类型');
propertyMap.set('demandStatus', '需求状态');
propertyMap.set('proposer', '需求提出人');
propertyMap.set('broker', '需求对接人');
propertyMap.set('developer', '开发者');
propertyMap.set('devops', '运维或其他');
propertyMap.set('file', '附件');
propertyMap.set('expectDate', '期望完成时间');
propertyMap.set('scheduleStartDate', '排期开始时间');
propertyMap.set('scheduleEndDate', '排期结束时间');
propertyMap.set('finishDate', '结束时间');
propertyMap.set('deleteDate', '下线时间');
propertyMap.set('demandNode', '需求节点');
propertyMap.set('isPending', '审核状态');

export const typeMap: Map<string, string> = new Map();
typeMap.set('1', '创建');
typeMap.set('2', '更新');
typeMap.set('3', '删除');
typeMap.set('4', '完成');
typeMap.set('5', '取消完成');
typeMap.set('6', '更新');
typeMap.set('7', '未归档');
typeMap.set('8', '归档');

export class DemandLogDetail {
  public id?: number;
  public type?: DemandLogType;
  public property?: DemandLogProperty;
  public demand?: DemandDetail;
  public oldDetail?: string;
  public newDetail?: string;
  public creator?: UserDetail;
  public createDate?: Date;
}
