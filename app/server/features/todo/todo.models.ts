export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly userId: string;
  readonly createdAt: Date;
}
