import type { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
}

export const ok = <T>(res: Response, data: T, message = "OK") =>
  res.status(200).json({ success: true, message, data } satisfies ApiResponse<T>);

export const created = <T>(res: Response, data: T, message = "Created") =>
  res.status(201).json({ success: true, message, data } satisfies ApiResponse<T>);

export const noContent = (res: Response) => res.status(204).send();
