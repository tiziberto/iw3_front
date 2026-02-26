import axios from "axios";
import type { Orden, Conciliacion } from "@/types";

const api = axios.create({
  baseURL: "/api/v1", // Ajustado para el proxy de Nginx
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (user: any) => api.post('/auth/register', user),
  getOrdenes: () => api.get<Orden[]>('/ordenes'),
  getOrden: (numeroOrden: number) => api.get<Orden>(`/ordenes/${numeroOrden}`),
  cerrarOrden: (numeroOrden: number) => api.put(`/ordenes/${numeroOrden}/close`),
  getConciliacion: (numeroOrden: number) => api.get<Conciliacion>(`/ordenes/${numeroOrden}/conciliacion`),
  aceptarAlarma: (numeroOrden: number) => api.put(`/ordenes/${numeroOrden}/aceptar-alarma`),
  getUsers: () => api.get('/users'),
  updateUser: (user: any) => api.put('/users/update', user),
  post: api.post, // Esto arreglará el error en auth.ts
};
