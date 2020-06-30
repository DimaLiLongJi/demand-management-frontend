import { Injectable } from '@angular/core';
import { HttpService } from '@/service/http.service';
import { IResponse, User, UserDetail } from '@/types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private httpService: HttpService,
  ) { }

  public getById(id: number): Observable<IResponse<UserDetail>> {
    return this.httpService.get<void, IResponse<UserDetail>>(`/api/user/${id}`);
  }

  public createUser(user: User) {
    return this.httpService.post<User, IResponse<UserDetail>>('/api/user', user);
  }

  public getUserList(query?: {
    pageIndex: number,
    pageSize: number,
    isOn?: '1' | '2' | '',
  }): Observable<IResponse<[UserDetail[], number]>> {
    return this.httpService.get<typeof query, IResponse<[UserDetail[], number]>>('/api/user/find', query);
  }

  public updateUser(id: number, user?: any): Observable<IResponse> {
    return this.httpService.post<User, IResponse>(`/api/user/${id}`, user);
  }

  public updatePassword(id: number, password: string) {
    return this.httpService.post<{ password: string }, IResponse>(`/api/user/${id}/password`, { password });
  }
}
