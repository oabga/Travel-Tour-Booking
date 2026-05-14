import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EmployeeDto } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly url = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<EmployeeDto[]> {
    return this.http.get<EmployeeDto[]>(this.url);
  }

  create(dto: EmployeeDto): Observable<EmployeeDto> {
    return this.http.post<EmployeeDto>(this.url, dto);
  }

  update(id: number, dto: EmployeeDto): Observable<EmployeeDto> {
    return this.http.put<EmployeeDto>(`${this.url}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
