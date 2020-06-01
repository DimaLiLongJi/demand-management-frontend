import { Injectable } from '@angular/core';
import { HttpService } from '@/service/http.service';
import { IResponse, DemandType, DemandTypeDetail } from '@/types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DemandTypeService {

  constructor(
    private httpService: HttpService,
  ) { }

  public getById(id: number): Observable<IResponse<DemandTypeDetail>> {
    return this.httpService.get<void, IResponse<DemandTypeDetail>>(`/api/demand-type/${id}`);
  }

  public createDemandType(demandType: DemandType) {
    return this.httpService.post<DemandType, IResponse<DemandTypeDetail>>('/api/demand-type', demandType);
  }

  public getDemandTypeList(query?: {
    pageIndex?: number,
    pageSize?: number,
    isOn?: '1' | '2' | '',
  }): Observable<IResponse<[DemandTypeDetail[], number]>> {
    return this.httpService.get<typeof query, IResponse<[DemandTypeDetail[], number]>>('/api/demand-type/find', query);
  }

  public updateDemandType(id: number, demandType?: any): Observable<IResponse> {
    return this.httpService.put<DemandType, IResponse>(`/api/demand-type/${id}`, demandType);
  }
}
