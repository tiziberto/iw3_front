import { defineStore } from "pinia";
import api from "../api/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null
  }),
  actions: {
    async login(username: string, password: string) {
      const res = await api.post("/auth/login", { username, password });
      this.token = res.data.token;
      this.role = res.data.role;
      localStorage.setItem("token", this.token!);
      localStorage.setItem("role", this.role!);
    },
    logout() {
      this.token = null;
      this.role = null;
      localStorage.clear();
    }
  }
});
