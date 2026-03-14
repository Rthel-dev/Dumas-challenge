import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly api = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.api);
  }

  getById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.api}/${id}`);
  }

  create(dto: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.api, dto);
  }

  update(id: string, dto: UpdateTaskRequest): Observable<Task> {
    return this.http.patch<Task>(`${this.api}/${id}`, dto);
  }

  delete(id: string): Observable<Task> {
    return this.http.delete<Task>(`${this.api}/${id}`);
  }
}
