import {Injectable, Inject, InjectionToken } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { API_URL } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient,
    public router: Router,
    private notification: NzNotificationService,
    @Inject(API_URL) private rootUrl: string,
  ) {}

  public getConfig() {
    return this.http.get('')
      .pipe(
        retry(3), // 重试3次
        catchError(this.handleError)
      );
  }

  public handleError = (error: HttpErrorResponse) => {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`error body was: `, error);
      this.notification.error('失败', `请求接口${error.url}失败，失败原因：${error.message}`, {
        nzDuration: 4000,
      });
    }
    return throwError(error.error || 'Something bad happened; please try again later.');
  }

  public createHttpParams<T>(data: T): HttpParams {
    if (!data) { return null; }
    return Object.getOwnPropertyNames(data)
      .reduce((p, key) => (data[key] ? p.set(key, data[key]) : p), new HttpParams());
  }

  public get = <T, D = any>(url: string, params?: T): Observable<D> => {
    const httpParams = this.createHttpParams<T>(params);
    const options = {params: httpParams };
    return this.http.get<D>(this.rootUrl + `${url}`, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  public post = <T, D = any>(url: string, body?: T): Observable<D> => {
    return this.http.post<D>(this.rootUrl + `${url}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public delete = <T, D = any>(url: string, params?: T): Observable<D> => {
    const httpParams = this.createHttpParams<T>(params);
    const options = {params: httpParams };
    return this.http.delete<D>(this.rootUrl + `${url}`, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  public put = <T, D = any>(url: string, body?: T, query?: T): Observable<D> => {
    const httpParams = this.createHttpParams<T>(query);
    const options = {params: httpParams };
    return this.http.put<D>(this.rootUrl + `${url}`, body, options)
      .pipe(
        catchError(this.handleError)
      );
  }
}
