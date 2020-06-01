import { Injectable } from '@angular/core';
import { HttpService } from '@/service/http.service';
import { IResponse, DemandLogDetail } from '@/types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DemandLogService {

  constructor(
    private httpService: HttpService,
  ) { }

  public getList(query?: {
    demand?: number,
    creator?: number,
  }): Observable<IResponse<[DemandLogDetail[], number]>> {
    return this.httpService.get<typeof query, IResponse<[DemandLogDetail[], number]>>('/api/demand-log/find', query);
  }
}
