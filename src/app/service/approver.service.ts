import { Injectable } from '@angular/core';
import { HttpService } from '@/service/http.service';
import { IResponse } from '@/types';
import { Observable } from 'rxjs';
import { ApproverDetail } from '@/types/approver';

@Injectable({
  providedIn: 'root',
})
export class ApproverService {
  constructor(
    private httpService: HttpService,
  ) { }

  public getAll(): Observable<IResponse<ApproverDetail[]>> {
    return this.httpService.get<IResponse<ApproverDetail[]>>('/api/approver/all');
  }
}
