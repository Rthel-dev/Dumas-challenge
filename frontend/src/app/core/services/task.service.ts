import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.models';

/** Servicio HTTP para operaciones CRUD de tareas. */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly api = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  /** @returns Observable con la lista completa de tareas del usuario. */
  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.api);
  }

  /**
   * Obtiene una tarea por su ID.
   * @param id - UUID de la tarea.
   */
  getById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.api}/${id}`);
  }

  /**
   * Crea una nueva tarea.
   * @param dto - Datos de la tarea a crear.
   */
  create(dto: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.api, dto);
  }

  /**
   * Actualiza parcialmente una tarea.
   * @param id - UUID de la tarea.
   * @param dto - Campos a actualizar.
   */
  update(id: string, dto: UpdateTaskRequest): Observable<Task> {
    return this.http.patch<Task>(`${this.api}/${id}`, dto);
  }

  /**
   * Elimina una tarea.
   * @param id - UUID de la tarea a eliminar.
   */
  delete(id: string): Observable<Task> {
    return this.http.delete<Task>(`${this.api}/${id}`);
  }
}
