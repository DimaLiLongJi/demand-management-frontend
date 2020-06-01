import { Injectable } from '@angular/core';
import { HttpService } from '@/service/http.service';
import { IResponse, UserDetail, ModuleDetail, PermissionDetail } from '@/types';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private privateSelf: UserDetail;
  private privateModuleList: ModuleDetail[] = [];
  private privatePermissionList: PermissionDetail[] = [];
  public permissionList$: BehaviorSubject<PermissionDetail[]> = new BehaviorSubject([]);
  public moduleList$: BehaviorSubject<ModuleDetail[]> = new BehaviorSubject([]);

  constructor(
    private httpService: HttpService,
  ) { }

  get self(): UserDetail {
    return this.privateSelf;
  }

  set self(user: UserDetail) {
    this.privateSelf = user;
  }

  get moduleList(): ModuleDetail[] {
    return this.privateModuleList;
  }

  set moduleList(moduleList: ModuleDetail[]) {
    this.privateModuleList = [...moduleList];
  }

  get permissionList(): PermissionDetail[] {
    return this.privatePermissionList;
  }

  set permissionList(permissionList: PermissionDetail[]) {
    if (!permissionList) return;
    this.privatePermissionList = [...permissionList];
  }

  public getSelf(): Observable<IResponse<UserDetail>> {
    return this.httpService.get<IResponse<UserDetail>>('/api/auth');
  }

  public login(user: {account: string, password: string}): Observable<IResponse> {
    return this.httpService.post<typeof user, IResponse>('/api/auth/login', user);
  }

  public logout(): Observable<IResponse> {
    return this.httpService.get<void, IResponse>('/api/auth/logout');
  }
}
