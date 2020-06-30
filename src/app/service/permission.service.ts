import { Injectable } from '@angular/core';
import { HttpService } from '@/service/http.service';
import { IResponse, Permission, PermissionDetail } from '@/types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(
    private httpService: HttpService,
  ) { }

  public getPermissionList(query?: {
    type?: '1' | '2' | '',
    pageIndex?: number,
    pageSize?: number,
    isOn?: '1' | '2' | '',
  }): Observable<IResponse<[PermissionDetail[], number]>> {
    return this.httpService.get<typeof query, IResponse<[PermissionDetail[], number]>>('/api/permission/find', query);
  }

  public getById(id: number): Observable<IResponse<PermissionDetail>> {
    return this.httpService.get<void, IResponse<PermissionDetail>>(`/api/permission/${id}`);
  }

  public createPermission(permission: Permission): Observable<IResponse<PermissionDetail>> {
    return this.httpService.post<Permission, IResponse<PermissionDetail>>('/api/permission', permission);
  }

  public updatePermission(id: number, permission?: any): Observable<IResponse> {
    return this.httpService.post<Permission, IResponse>(`/api/permission/${id}`, permission);
  }
}
