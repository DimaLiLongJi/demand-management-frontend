import { Injectable } from '@angular/core';
import { HttpService } from '@/service/http.service';
import { IResponse, DemandNode, DemandNodeDetail } from '@/types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DemandNodeService {
  constructor(
    private httpService: HttpService,
  ) { }

  public getById(id: number): Observable<IResponse<DemandNodeDetail>> {
    return this.httpService.get<void, IResponse<DemandNodeDetail>>(`/api/demand-node/${id}`);
  }

  public delete(id: number): Observable<IResponse> {
    return this.httpService.delete<void, IResponse>(`/api/demand-node/${id}`);
  }

  public create(demandNode: DemandNode) {
    return this.httpService.post<DemandNode, IResponse<DemandNodeDetail>>('/api/demand-node', demandNode);
  }

  public getList(query?: {
    pageIndex?: number,
    pageSize?: number,
    demandProgress?: number,
    user?: number,
  }): Observable<IResponse<[DemandNodeDetail[], number]>> {
    return this.httpService.get<typeof query, IResponse<[DemandNodeDetail[], number]>>('/api/demand-node/find', query);
  }

  public update(id: number, demandNode?: any): Observable<IResponse> {
    return this.httpService.post<DemandNode, IResponse>(`/api/demand-node/${id}`, demandNode);
  }
}
