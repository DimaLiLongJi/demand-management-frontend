export interface IResponse<T = any> {
  message: string;
  success: boolean;
  data?: T;
}
