import { Injectable } from '@angular/core';
import { HttpService } from '@/service/http.service';
import { IResponse, Demand, DemandDetail, IDemandSearch, IDemandSelfSearch } from '@/types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DemandService {
  constructor(
    private httpService: HttpService,
  ) { }

  public getSelfDemandList(query?: IDemandSelfSearch): Observable<IResponse<[DemandDetail[], number]>> {
    return this.httpService.get<IDemandSelfSearch, IResponse<[DemandDetail[], number]>>('/api/demand/find-self', query);
  }

  public getDemandList(query?: IDemandSearch): Observable<IResponse<[DemandDetail[], number]>> {
    return this.httpService.get<IDemandSearch, IResponse<[DemandDetail[], number]>>('/api/demand/find', query);
  }

  public getById(id: number): Observable<IResponse<DemandDetail>> {
    return this.httpService.get<void, IResponse<DemandDetail>>(`/api/demand/${id}`);
  }

  public createDemand(demand: Demand): Observable<IResponse<DemandDetail>> {
    return this.httpService.post<Demand, IResponse<DemandDetail>>('/api/demand', demand);
  }

  public updateDemand(id: number, demand?: any): Observable<IResponse> {
    return this.httpService.put<Demand, IResponse>(`/api/demand/${id}`, demand);
  }

  public passDemand(id: number): Observable<IResponse> {
    return this.httpService.put<Demand, IResponse>(`/api/demand/pass/${id}`);
  }

  public removeFile(info: { demandId: number, fileId: number }): Observable<IResponse> {
    return this.httpService.put<typeof info, IResponse>(`/api/demand/deleteFile`, info);
  }
}
