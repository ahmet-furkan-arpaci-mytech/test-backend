export interface IGenericResponse<T = undefined> {
  message: string;
  result: T;
  success: boolean;
  errorCode?: number;
}
