import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiGatewayUrl || '';
  private cache = new Map<string, Observable<any>>();

  constructor(public http: HttpClient, private auth: AuthService) {
    console.log('ApiService initialized with baseUrl:', this.baseUrl);
  }

  private headers(): HttpHeaders {
    const token = this.auth.token;
    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return new HttpHeaders(headers);
  }

  private unwrap<T>(data: any): T {
    if (data && data.$values && Array.isArray(data.$values)) {
      return data.$values as T;
    }
    return data as T;
  }

  get<T>(path: string, useCache = false): Observable<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    
    if (useCache && this.cache.has(url)) {
      console.log('Returning cached data for:', url);
      return this.cache.get(url)!;
    }

    console.log('GET Request:', url);
    const request = this.http.get<T>(url, { headers: this.headers() }).pipe(
      tap(res => console.log('GET Response from', url, ':', res)),
      map(data => this.unwrap<T>(data)),
      catchError(e => {
        console.error('API Error from', url, ':', e);
        this.cache.delete(url); // Don't cache errors
        return throwError(() => new Error(e?.error?.message || e?.statusText || 'Request failed'));
      }),
      shareReplay(1)
    );

    if (useCache) {
      this.cache.set(url, request);
    }

    return request;
  }

  post<T>(path: string, body: unknown = {}): Observable<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    console.log('POST Request:', url, body);
    this.cache.clear(); // Clear cache on mutations
    return this.http.post<T>(url, body, { headers: this.headers() }).pipe(
      map(data => this.unwrap<T>(data)),
      catchError(e => throwError(() => new Error(e?.error?.message || e?.statusText || 'Request failed')))
    );
  }

  put<T>(path: string, body: unknown = {}): Observable<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    console.log('PUT Request:', url, body);
    this.cache.clear();
    return this.http.put<T>(url, body, { headers: this.headers() }).pipe(
      map(data => this.unwrap<T>(data)),
      catchError(e => throwError(() => new Error(e?.error?.message || e?.statusText || 'Request failed')))
    );
  }

  patch<T>(path: string, body: unknown = {}): Observable<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    console.log('PATCH Request:', url, body);
    this.cache.clear();
    return this.http.patch<T>(url, body, { headers: this.headers() }).pipe(
      tap(res => console.log('PATCH Response from', url, ':', res)),
      map(data => this.unwrap<T>(data)),
      catchError(e => {
        console.error('API Error from', url, ':', e);
        return throwError(() => new Error(e?.error?.message || e?.statusText || 'Request failed'));
      })
    );
  }

  delete<T>(path: string): Observable<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    console.log('DELETE Request:', url);
    this.cache.clear();
    return this.http.delete<T>(url, { headers: this.headers() }).pipe(
      map(data => this.unwrap<T>(data)),
      catchError(e => throwError(() => new Error(e?.error?.message || e?.statusText || 'Request failed')))
    );
  }
}
