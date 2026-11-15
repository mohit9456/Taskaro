import axios, { AxiosRequestConfig } from "axios";

const baseURL = `${process.env.NEXT_PUBLIC_HOST || ""}/api`;

// Public API client
export const Api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {},
});

// GET request with credentials
export const protectedApiGet = async <T = any>(
  path: string,
  params?: Record<string, any>,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await Api.get<T>(path, {
    params,
    withCredentials: true,
    ...config,
  });
  return response.data;
};

// POST request with credentials
export const protectedApiPost = async <T = any>(
  path: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await Api.post<T>(path, data, {
    withCredentials: true,
    ...config,
  });
  return response.data;
};

// PATCH request with credentials
export const protectedApiPatch = async <T = any>(
  path: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await Api.patch<T>(path, data, {
    withCredentials: true,
    ...config,
  });
  return response.data;
};

// DELETE request with credentials
export const protectedApiDelete = async <T = any>(
  path: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await Api.delete<T>(path, {
    withCredentials: true,
    ...config,
  });
  return response.data;
};

