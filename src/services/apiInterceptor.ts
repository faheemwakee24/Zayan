import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const api: AxiosInstance = axios.create();

if (typeof window !== "undefined") {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("zayanToken");
      if (token) {
        const headers = config.headers ?? new AxiosHeaders();
        headers.set("Authorization", `Bearer ${token}`);
        config.headers = headers;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        // TODO: optionally dispatch a logout or refresh logic
      }
      return Promise.reject(error);
    }
  );
}

export default api;
