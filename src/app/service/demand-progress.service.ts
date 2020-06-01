import { Injectable } from '@angular/core';
import { HttpService } from '@/service/http.service';
import { IResponse, DemandProgressDetail, DemandProgress } from '@/types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DemandProgressService {
  constructor(
    private httpService: HttpService,
  ) { }

  public getById(id: number): Observable<IResponse<DemandProgressDetail>> {
    return this.httpService.get<void, IResponse<DemandProgressDetail>>(`/api/demand-progress/${id}`);
  }

  public delete(id: number): Observable<IResponse> {
    return this.httpService.delete<void, IResponse>(`/api/demand-progress/${id}`);
  }

  public create(demandProgress: DemandProgress) {
    return this.httpService.post<DemandProgress, IResponse<DemandProgressDetail>>('/api/demand-progress', demandProgress);
  }

  public getList(query?: {
    pageIndex?: number,
    pageSize?: number,
    demand?: number,
    user?: number,
  }): Observable<IResponse<[DemandProgressDetail[], number]>> {
    return this.httpService.get<typeof query, IResponse<[DemandProgressDetail[], number]>>('/api/demand-progress/find', query);
  }

  public update(id: number, demandProgress?: any): Observable<IResponse> {
    return this.httpService.put<DemandProgress, IResponse>(`/api/demand-progress/${id}`, demandProgress);
  }
}
