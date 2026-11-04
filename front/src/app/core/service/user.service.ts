import { HttpClient } from '@angular/common/http';
import { inject,  Injectable, InjectionToken } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { User } from '../models/user.interface';


export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});

const APP_TIME_ZONE = 'Europe/Paris';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly httpClient = inject(HttpClient);

  private readonly baseUrl = `${inject(API_BASE_URL)}/users`;

  
  public getById(id: string): Observable<User> {
    return this.httpClient.get<User>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  public delete(id: string): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }
  
}
