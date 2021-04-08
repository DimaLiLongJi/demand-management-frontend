import { Injectable, InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentServiceService {
  public environment: boolean = environment.production;
  public basePrefix: string = environment.production ? '/demand-manager' : '/demand-manager';
}

export const API_URL = new InjectionToken<string>('api_url', {
  providedIn: 'root',
  factory: () => (environment.production ? '/demand-manager' : '/demand-manager')
});
