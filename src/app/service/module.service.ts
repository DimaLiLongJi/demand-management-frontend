import { Injectable } from '@angular/core';
import { HttpService } from '@/service/http.service';
import { IResponse, Module, ModuleDetail } from '@/types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModuleService {
  constructor(
    private httpService: HttpService,
  ) { }

  public createModule(body: Module): Observable<IResponse<Module>> {
    return this.httpService.post<Module, IResponse<Module>>('/api/module', body);
  }

  public getModuleList(): Observable<IResponse<[ModuleDetail[], number]>> {
    return this.httpService.get<void, IResponse<[ModuleDetail[], number]>>('/api/module/all');
  }
}
