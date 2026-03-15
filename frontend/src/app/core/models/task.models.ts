/** Representacion completa de una tarea proveniente del servidor. */
export interface Task {
  /** Identificador unico UUID. */
  id: string;
  /** Titulo de la tarea. */
  title: string;
  /** Fecha limite en formato ISO 8601, o `null` si no tiene. */
  dueDate: string | null;
  /** Indica si la tarea esta completada. */
  completed: boolean;
  /** ID del usuario propietario. */
  userId: string;
  /** Fecha de creacion en formato ISO 8601. */
  createdAt: string;
  /** Fecha de ultima actualizacion en formato ISO 8601. */
  updatedAt: string;
}

/** Cuerpo de la solicitud para crear una tarea. */
export interface CreateTaskRequest {
  title: string;
  dueDate?: string;
  completed?: boolean;
}

/** Cuerpo de la solicitud para actualizar parcialmente una tarea. */
export interface UpdateTaskRequest {
  title?: string;
  dueDate?: string;
  completed?: boolean;
}
