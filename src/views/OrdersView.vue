<template>
  <v-container fluid class="pa-6 bg-main-dark min-h-screen">
    
    <v-row class="mb-6" v-if="store.stats">
      <v-col cols="12" sm="3" v-for="(kpi, i) in kpiList" :key="i">
        <v-card class="kpi-card" variant="flat">
          <v-card-text class="d-flex align-center pa-4">
            <v-avatar :color="kpi.color" variant="tonal" class="mr-4">
              <v-icon>{{ kpi.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-black text-white">{{ kpi.value }}</div>
              <div class="text-caption text-grey uppercase">{{ kpi.label }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div class="mb-8">
      <h1 class="text-h3 font-weight-black text-white mb-4">MONITOR <span class="text-primary">CARGAS</span></h1>
      
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="filterText"
            prepend-inner-icon="mdi-magnify"
            label="Buscar por Orden, Camión o Chofer..."
            variant="solo"
            density="comfortable"
            bg-color="#161b22"
            flat
            hide-details
            class="custom-search"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filterStatus"
            :items="statusOptions"
            label="Estado"
            variant="solo"
            density="comfortable"
            bg-color="#161b22"
            flat
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            label="Ordenar por"
            variant="solo"
            density="comfortable"
            bg-color="#161b22"
            flat
            hide-details
          ></v-select>
        </v-col>
      </v-row>
    </div>

    <v-row v-if="filteredOrders.length > 0">
      <v-col v-for="orden in filteredOrders" :key="orden?.id || Math.random()" cols="12">
        <v-card class="order-card" :class="{ 'alarm-border': orden?._tieneAlarma }">
          <v-card-text class="d-flex align-center pa-0">
            
            <div class="state-line" :class="`bg-${getStatusColor(orden?._estadoId)}`"></div>
            
            <div class="pa-4 text-center border-r" style="min-width: 140px">
              <div class="text-h5 font-weight-bold text-white">#{{ orden?.numeroOrden }}</div>
              <v-chip size="x-small" :color="getStatusColor(orden?._estadoId)" label class="font-weight-bold mt-1">
                {{ orden?._estadoNombre }}
              </v-chip>
            </div>

            <div class="pa-4 border-r" style="width: 200px">
              <div class="text-white font-weight-bold">
                <v-icon size="small" class="mr-1" color="grey">mdi-truck</v-icon> 
                {{ orden?.camion?.patente || 'S/D' }}
              </div>
              <div class="text-caption text-grey text-truncate">
                {{ orden?.chofer?.apellido || 'N/A' }}, {{ orden?.chofer?.nombre || '' }}
              </div>
            </div>

            <div class="pa-4 flex-grow-1 border-r">
              <div class="d-flex justify-space-between align-end mb-1">
                <div>
                  <span class="text-h5 text-white font-weight-black">
                    {{ Math.round(orden?.ultimaMasaAcumulada || 0) }} 
                  </span>
                  <span class="text-grey ml-1">/ {{ orden?.preset }} kg</span>
                </div>
                <span class="text-primary font-weight-bold text-h6">{{ Math.round(orden?._progreso || 0) }}%</span>
              </div>
              <v-progress-linear 
                :model-value="orden?._progreso || 0" 
                :color="getStatusColor(orden?._estadoId)" 
                height="10" 
                rounded 
                striped
                :active="orden?._estadoId === 2"
              ></v-progress-linear>
              
              <div v-if="orden?._estadoId === 2" class="d-flex justify-space-between mt-2 text-caption">
                <div class="text-primary font-weight-bold">
                  <v-icon size="x-small" color="primary" class="mr-1">mdi-timer-sand</v-icon>
                  ETA: <span>{{ getETA(orden) }}</span>
                </div>
              </div>
            </div>

            <div class="pa-4 border-r text-center" style="min-width: 180px">
                <div class="text-caption text-grey font-weight-bold mb-1" style="font-size: 0.7rem;">TELEMETRÍA</div>
                
                <div v-if="orden.ultimaTemperatura !== undefined">
                    <div class="d-flex justify-center align-center mb-2">
                        <v-tooltip location="top" text="Temperatura">
                          <template v-slot:activator="{ props }">
                            <div v-bind="props" class="d-flex align-center mr-3">
                                <v-icon size="x-small" color="red-lighten-2" class="mr-1">mdi-thermometer</v-icon>
                                <span class="text-white font-weight-bold">{{ orden.ultimaTemperatura != null ? orden.ultimaTemperatura.toFixed(1) : '--' }} °C</span>
                            </div>
                          </template>
                        </v-tooltip>
                        
                        <v-tooltip location="top" text="Densidad">
                          <template v-slot:activator="{ props }">
                            <div v-bind="props" class="d-flex align-center">
                                <v-icon size="x-small" color="blue-lighten-2" class="mr-1">mdi-water-opacity</v-icon>
                                <span class="text-white font-weight-bold">{{ orden.ultimaDensidad?.toFixed(3) }}</span>
                            </div>
                          </template>
                        </v-tooltip>
                    </div>

                    <div class="d-flex justify-center align-center bg-grey-darken-4 rounded px-2 py-1 border-thin">
                        <v-icon size="small" color="green-accent-3" class="mr-2">mdi-speedometer</v-icon>
                        <span class="text-h6 font-weight-black text-green-accent-3" style="line-height: 1;">
                            {{ orden._caudal?.toFixed(0) || 0 }}
                        </span>
                        <span class="text-caption text-grey ml-1">kg/h</span>
                    </div>
                </div>
                
                <div v-else class="d-flex flex-column align-center justify-center h-100 opacity-50">
                    <v-icon size="small" class="mb-1">mdi-access-point-network-off</v-icon>
                    <span class="text-caption">Sin Datos</span>
                </div>
            </div>

            <div class="pa-4 d-flex align-center">
              <v-btn 
                v-if="orden?._estadoId === 4"
                icon 
                color="success" 
                variant="tonal" 
                class="mr-2"
                @click="downloadConciliacion(orden)"
              >
                <v-icon>mdi-file-pdf-box</v-icon>
                <v-tooltip activator="parent" location="top">Descargar Conciliación</v-tooltip>
              </v-btn>
            </div>

          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row v-else class="mt-12" justify="center">
      <div class="text-grey text-center">
        <v-icon size="64" color="grey-darken-3">mdi-clipboard-text-off-outline</v-icon>
        <div class="mt-2">No se encontraron órdenes con los filtros aplicados.</div>
      </div>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useOrdersStore } from '../stores/orders';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const store = useOrdersStore();

// --- Reloj Interno para Reactividad de Tiempos ---
const currentTime = ref(Date.now());
let timerInterval: any = null;

// --- Filtros y Ordenamiento ---
const filterText = ref('');
const filterStatus = ref('Todos');
const sortBy = ref('Número');

const statusOptions = ['Todos', '1: Esperando tara', '2: En Carga', '3: Cerradas', '4: Finalizadas'];
const sortOptions = ['Número', 'Progreso', 'Caudal'];

const filteredOrders = computed(() => {
  let orders = [...(store.ordenesProcesadas || [])];

  if (filterText.value) {
    const search = filterText.value.toLowerCase();
    orders = orders.filter(o => 
      o.numeroOrden.toString().includes(search) ||
      o.camion?.patente?.toLowerCase().includes(search) ||
      o.chofer?.apellido?.toLowerCase().includes(search)
    );
  }

  if (filterStatus.value !== 'Todos') {
    const statusId = parseInt((filterStatus.value || "").split(':')[0]);
    orders = orders.filter(o => o._estadoId === statusId);
  }

  orders.sort((a, b) => {
    if (sortBy.value === 'Número') return b.numeroOrden - a.numeroOrden;
    if (sortBy.value === 'Progreso') return (b._progreso || 0) - (a._progreso || 0);
    if (sortBy.value === 'Caudal') return (b._caudal || 0) - (a._caudal || 0);
    return 0;
  });

  return orders;
});

// --- Lógica de Tiempos y ETA Corregida ---
const getETA = (orden: any) => {
  const caudal = orden._caudal || 0;
  const faltante = (orden.preset || 0) - (orden.ultimaMasaAcumulada || 0);
  
  // Si no hay caudal significativo (>50kg/h) o ya terminó, no calcular
  if (caudal < 50 || faltante <= 0) return '---';
  
  const minutosRestantes = Math.ceil((faltante / (caudal / 60)));
  
  if (minutosRestantes > 1440) return '+24h';
  
  if (minutosRestantes >= 60) {
    const horas = Math.floor(minutosRestantes / 60);
    const mins = minutosRestantes % 60;
    return `${horas}h ${mins}m`;
  }
  return `${minutosRestantes} min`;
};

const getElapsedTime = (orden: any) => {
  if (!orden.fechaCargaInicio) return '00:00';
  
  const inicio = new Date(orden.fechaCargaInicio).getTime();
  const diff = Math.floor((currentTime.value - inicio) / 1000); // Uso de currentTime.value para reactividad
  
  if (diff < 0) return '00:00';
  
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  
  return h > 0 
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// --- KPIs ---
const kpiList = computed(() => [
  { label: 'Totales', value: store.stats?.total || 0, icon: 'mdi-file-document-multiple', color: 'blue' },
  { label: 'En Carga', value: store.stats?.activas || 0, icon: 'mdi-truck-fast', color: 'primary' },
  { label: 'Alarmas', value: store.stats?.alertas || 0, icon: 'mdi-alarm-light', color: 'red' },
  { label: 'Masa Total', value: Math.round(store.stats?.cargaTotal || 0), icon: 'mdi-scale', color: 'green' }
]);

const getStatusColor = (id: any) => {
  const colors: Record<number, string> = { 1: 'orange', 2: 'blue', 3: 'purple', 4: 'success' };
  return colors[id] || 'grey';
};

const downloadConciliacion = (orden: any) => {
  const doc = new jsPDF();
  doc.setFillColor(25, 118, 210);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(`ORDEN DE CARGA #${orden.numeroOrden}`, 14, 13);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Fecha Emisión: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Cliente: ${orden.cliente?.razonSocial || 'Consumidor Final'}`, 14, 35);
  doc.text(`Chofer: ${orden.chofer?.apellido}, ${orden.chofer?.nombre}`, 14, 40);
  doc.text(`Camión: ${orden.camion?.patente}`, 14, 45);

  autoTable(doc, {
    startY: 55,
    head: [['Concepto', 'Medición']],
    body: [
      ['Producto', orden.producto?.nombre || 'GLP'],
      ['Preset Configurado', `${orden.preset} kg`],
      ['Masa Acumulada', `${orden.ultimaMasaAcumulada} kg`],
      ['Densidad Promedio', `${orden.ultimaDensidad?.toFixed(4) || 0} g/cm³`],
      ['Temperatura Promedio', `${orden.ultimaTemperatura?.toFixed(2) || 0} °C`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [25, 118, 210] }
  });
  doc.save(`Conciliacion_${orden.numeroOrden}.pdf`);
};

// --- Ciclo de Vida ---
onMounted(() => {
  store.startPolling();
  // Actualizar el cronómetro local cada segundo
  timerInterval = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  store.stopPolling();
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
.bg-main-dark { background-color: #0d1117; }
.kpi-card { background: #161b22 !important; border: 1px solid #30363d !important; border-radius: 8px; }
.order-card { background: #161b22 !important; border: 1px solid #30363d !important; margin-bottom: 12px; position: relative; border-radius: 8px; transition: all 0.2s; }
.order-card:hover { border-color: #58a6ff !important; background: #1c2128 !important; }
.state-line { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
.border-r { border-right: 1px solid rgba(255,255,255,0.08); }
.border-thin { border: 1px solid rgba(255,255,255,0.1); }
.alarm-border { border: 1px solid #f85149 !important; box-shadow: 0 0 10px rgba(248, 81, 73, 0.2); }
.custom-search :deep(.v-field__input) { color: white !important; }

</style>

