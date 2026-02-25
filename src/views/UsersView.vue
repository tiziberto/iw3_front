<template>
  <v-container fluid class="fill-height align-start pa-6 bg-background">
    <div class="mb-6 w-100 d-flex justify-space-between align-center">
      <div>
        <h1 class="text-h4 font-weight-bold text-white">Gestión de Usuarios</h1>
        <p class="text-grey">Administración de accesos y roles del sistema</p>
      </div>
      <v-btn color="primary" @click="cargarUsuarios" :loading="loading" prepend-icon="mdi-refresh">
        Actualizar
      </v-btn>
    </div>
    
    <v-card class="glass-card" elevation="0">
      <v-data-table 
        :headers="headers" 
        :items="usuarios" 
        :loading="loading"
        class="premium-table bg-transparent"
        hover
      >
        <template v-slot:item.username="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="grey-darken-3" size="32" class="mr-3">
              <span class="text-caption font-weight-bold">
                {{ item.username.substring(0,2).toUpperCase() }}
              </span>
            </v-avatar>
            <span class="font-weight-bold text-white">{{ item.username }}</span>
          </div>
        </template>

        <template v-slot:item.roles="{ item }">
          <div class="d-flex flex-wrap">
            <v-chip 
              v-for="rol in item.roles" 
              :key="rol.id" 
              size="small" 
              :color="getRoleColor(rol.name)"
              label
              variant="flat"
              class="font-weight-bold mr-1 mb-1"
            >
              {{ rol.name.replace('ROLE_', '') }}
            </v-chip>
          </div>
        </template>
        
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api/api';

const usuarios = ref([]);
const loading = ref(false);

// Columnas simplificadas: solo Usuario, Email y Roles
const headers = [
  { title: 'Usuario', key: 'username', width: '200px' },
  { title: 'Email', key: 'email' },
  { title: 'Roles', key: 'roles' }
];

const cargarUsuarios = async () => {
  loading.value = true;
  try {
    // Asegúrate de que api.getUsers() esté definido en tu archivo api.ts
    const { data } = await api.getUsers();
    usuarios.value = data;
  } catch (e) {
    console.error("Error al cargar usuarios:", e);
  } finally {
    loading.value = false;
  }
};

const getRoleColor = (rol: string) => {
  const r = rol.toUpperCase();
  if (r.includes('ADMIN')) return 'red';
  if (r.includes('SAP')) return 'blue';
  if (r.includes('TMS')) return 'purple';
  if (r.includes('CLI')) return 'orange';
  return 'grey-darken-1';
};

onMounted(cargarUsuarios);
</script>

<style scoped>
.bg-background { 
  background-color: #121212 !important; 
  min-height: 100vh; 
}
.glass-card { 
  background: #1E1E1E; 
  border: 1px solid #333; 
  border-radius: 8px; 
}
:deep(.premium-table) { 
  background: transparent !important; 
  color: #E0E0E0; 
}
/* Estilo opcional para espaciado de chips */
.gap-1 {
  gap: 4px;
}
</style>