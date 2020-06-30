import { Injectable } from '@angular/core';
import { HttpService } from '@/service/http.service';
import { IResponse, User, Role, RoleDetail } from '@/types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleService {

  constructor(
    private httpService: HttpService,
  ) { }

  public getById(id: number): Observable<IResponse<RoleDetail>> {
    return this.httpService.get<void, IResponse<RoleDetail>>(`/api/role/${id}`);
  }

  public createRole(role: Role) {
    return this.httpService.post<Role, IResponse<RoleDetail>>('/api/role', role);
  }

  public getRoleList(query?: {
    pageIndex?: number,
    pageSize?: number,
    isOn?: '1' | '2' | '',
  }): Observable<IResponse<[RoleDetail[], number]>> {
    return this.httpService.get<typeof query, IResponse<[RoleDetail[], number]>>('/api/role/find', query);
  }

  public updateRole(id: number, role?: any): Observable<IResponse> {
    return this.httpService.post<Role, IResponse>(`/api/role/${id}`, role);
  }
}
