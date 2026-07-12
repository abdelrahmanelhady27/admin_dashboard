import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StaticUser } from '../models/user.model';
import { environment } from '../../../environments/environment.dev';

@Injectable({ providedIn: 'root' })
export class StaticUserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users/static/search`;

  search(term: string): Observable<StaticUser[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<StaticUser[]>(this.apiUrl, { params });
  }
}
