import { Injectable } from '@angular/core';
import { HttpService } from '@/service/http.service';
import { IResponse, DemandStatus, DemandStatusDetail } from '@/types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DemandStatusService {

  constructor(
    private httpService: HttpService,
  ) { }

  public getById(id: number): Observable<IResponse<DemandStatusDetail>> {
    return this.httpService.get<void, IResponse<DemandStatusDetail>>(`/api/demand-status/${id}`);
  }

  public createDemandStatus(demandStatus: DemandStatus) {
    return this.httpService.post<DemandStatus, IResponse<DemandStatusDetail>>('/api/demand-status', demandStatus);
  }

  public getDemandStatusList(query?: {
    pageIndex?: number,
    pageSize?: number,
    isOn?: '1' | '2' | '',
  }): Observable<IResponse<[DemandStatusDetail[], number]>> {
    return this.httpService.get<typeof query, IResponse<[DemandStatusDetail[], number]>>('/api/demand-status/find', query);
  }

  public updateDemandStatus(id: number, demandStatus?: any): Observable<IResponse> {
    return this.httpService.put<DemandStatus, IResponse>(`/api/demand-status/${id}`, demandStatus);
  }
}
