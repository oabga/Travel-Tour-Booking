import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../shared/models';

export interface RoleDto {
  roleId: number;
  roleName: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly url = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RoleDto[]> {
    return this.http.get<ApiResponse<RoleDto[]>>(this.url)
      .pipe(map(r => r.data));
  }
}
