import { Injectable } from '@angular/core';
import { HttpService } from '@/service/http.service';
import { IResponse, DemandTypeStatusIndexDetail, DemandTypeStatusIndex } from '@/types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DemandTypeStatusIndexService {

  constructor(
    private httpService: HttpService,
  ) { }

  public getByDemandTypeId(typeId: number): Observable<IResponse<DemandTypeStatusIndexDetail[]>> {
    return this.httpService.get<void, IResponse<DemandTypeStatusIndexDetail[]>>(`/api/demand-type-stataus-index/${typeId}`);
  }
  public createByDemandTypeId(typeId: number, indexList: DemandTypeStatusIndex[]): Observable<IResponse<DemandTypeStatusIndexDetail[]>> {
    return this.httpService.post<DemandTypeStatusIndex[], IResponse<DemandTypeStatusIndexDetail[]>>(`/api/demand-type-stataus-index/${typeId}`, indexList);
  }
}
