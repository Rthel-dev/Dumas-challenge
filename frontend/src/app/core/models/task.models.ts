export interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  dueDate?: string;
  completed?: boolean;
}

export interface UpdateTaskRequest {
  title?: string;
  dueDate?: string;
  completed?: boolean;
}
