<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 bg-white/65 backdrop-blur-md border-t border-gray-200 shadow-2xl rounded-t-xl p-6 flex flex-col"
      style="width: 90vw; max-width: 1400px; min-height: 100px; max-height: 500px;"
    >
      <div class="absolute top-3 right-4 flex gap-2 items-center">
        <button
          v-if="hasFilters"
          @click="$emit('clear-filters')"
          class="text-xs bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded px-3 py-1 font-medium shadow focus:outline-none"
          aria-label="Eliminar filtros"
        >
          <i class="fa-solid fa-filter-circle-xmark mr-1 text-red-400"></i> Eliminar filtros
        </button>
        <button
  @click="$emit('close')"
  class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
  aria-label="Cerrar panel"
  title="Cerrar panel"
>
  <i class="fa-solid fa-xmark text-xl"></i>
</button>

      </div>
      <div class="flex flex-col md:flex-row gap-6 w-full">
        <!-- Departamentos de Salud como tarjetas -->
        <div class="flex-1 min-w-0">
          <div v-if="areasSalud?.length" class="mb-3">
            <div class="font-semibold text-gray-700 mb-2 text-sm">Departamentos de Salud</div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div
                v-for="area in showAllAreas ? areasSalud : areasSalud.slice(0, 3)"
                :key="area"
                @click="$emit('filter-area', area)"
                class="cursor-pointer transition ring-1 ring-transparent hover:ring-green-400 bg-green-100 border border-green-300 rounded-lg px-4 py-2 flex items-center shadow-sm"
              >
                <span
                  class="text-xs text-green-900 font-medium truncate"
                  :title="area"
                >{{ area }}</span>
              </div>
              <!-- Departamentos de Salud -->
              <button
                v-if="areasSalud.length > 3"
                @click.stop="showAllAreas = !showAllAreas"
                class="bg-green-200 text-green-900 border border-green-300 rounded-lg px-4 py-2 text-xs font-medium shadow-sm focus:outline-none"
              >
                {{ showAllAreas ? 'Ver menos' : `+${areasSalud.length - 3} más` }}
              </button>
            </div>
          </div>
        </div>
        <!-- Municipios como tarjetas -->
        <div class="flex-1 min-w-0">
          <div v-if="municipios?.length" class="mb-3">
            <div class="font-semibold text-gray-700 mb-2 text-sm">Municipios</div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div
                v-for="municipio in showAllMunicipios ? municipios : municipios.slice(0, 3)"
                :key="municipio"
                @click="$emit('filter-municipio', municipio)"
                class="cursor-pointer transition ring-1 ring-transparent hover:ring-blue-400 bg-blue-100 border border-blue-300 rounded-lg px-4 py-2 flex items-center shadow-sm"
              >
                <span
                  class="text-xs text-blue-900 font-medium truncate"
                  :title="municipio"
                >{{ municipio }}</span>
              </div>
              <!-- Municipios -->
              <button
                v-if="municipios.length > 3"
                @click.stop="showAllMunicipios = !showAllMunicipios"
                class="bg-blue-200 text-blue-900 border border-blue-300 rounded-lg px-4 py-2 text-xs font-medium shadow-sm focus:outline-none"
              >
                {{ showAllMunicipios ? 'Ver menos' : `+${municipios.length - 3} más` }}
              </button>
            </div>
          </div>
        </div>
        <!-- Tipos de centro como tarjetas -->
        <div class="flex-1 min-w-0">
          <div class="mb-3">
            <div class="font-semibold text-gray-700 mb-2 text-sm">Tipos de Centro</div>
            <div class="grid grid-cols-1 gap-3">
              <div class="bg-rose-100 border border-rose-300 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm">
                <span class="text-xs text-rose-900 font-semibold flex items-center gap-2">
                  <i class="fa-solid fa-hospital text-rose-500"></i> Hospitales
                </span>
                <span class="text-lg font-extrabold text-rose-700">{{ tipoCounts.hospitales }}</span>
              </div>
              <div class="bg-indigo-100 border border-indigo-300 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm">
                <span class="text-xs text-indigo-900 font-semibold flex items-center gap-2">
                  <i class="fa-solid fa-stethoscope text-indigo-500"></i> Centros de Especialidades
                </span>
                <span class="text-lg font-extrabold text-indigo-700">{{ tipoCounts.especialidades }}</span>
              </div>
              <div class="bg-blue-100 border border-blue-300 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm">
                <span class="text-xs text-blue-900 font-semibold flex items-center gap-2">
                  <i class="fa-solid fa-user-doctor text-blue-500"></i> Centros de Salud
                </span>
                <span class="text-lg font-extrabold text-blue-700">{{ tipoCounts.salud }}</span>
              </div>
              <div class="bg-lime-100 border border-lime-300 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm">
                <span class="text-xs text-lime-900 font-semibold flex items-center gap-2">
                  <i class="fa-solid fa-house-medical text-lime-500"></i> Consultorios Auxiliares
                </span>
                <span class="text-lg font-extrabold text-lime-700">{{ tipoCounts.consultorios }}</span>
              </div>
              <div class="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm">
                <span class="text-xs text-gray-900 font-semibold flex items-center gap-2">
                  <i class="fa-solid fa-location-dot text-gray-500"></i> Otros
                </span>
                <span class="text-lg font-extrabold text-gray-700">{{ tipoCounts.otros }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Indicadores de plazas como tarjetas -->
        <div class="flex-1 min-w-0">
          <div class="mb-3">
            <div class="font-semibold text-gray-700 mb-2 text-sm">Plazas</div>
            <div class="grid grid-cols-1 gap-3">
              <div class="bg-sky-100 border border-sky-300 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm">
                <span class="text-xs text-sky-900 font-semibold flex items-center gap-2">
                  <i class="fa-solid fa-circle-plus text-sky-500"></i> Ofertadas
                </span>
                <span class="text-lg font-extrabold text-sky-700">{{ plazasTotals.ofertadas }}</span>
              </div>
              <div class="bg-emerald-100 border border-emerald-300 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm">
                <span class="text-xs text-emerald-900 font-semibold flex items-center gap-2">
                  <i class="fa-solid fa-user-check text-emerald-500"></i> Asignadas
                </span>
                <span class="text-lg font-extrabold text-emerald-700">{{ plazasTotals.asignadas }}</span>
              </div>
              <div class="bg-amber-100 border border-amber-300 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm">
                <span class="text-xs text-amber-900 font-semibold flex items-center gap-2">
                  <i class="fa-solid fa-circle-dot text-amber-500"></i> Disponibles
                </span>
                <span class="text-lg font-extrabold text-amber-700">{{ plazasTotals.disponibles }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  show: Boolean,
  areasSalud: { type: Array, default: () => [] },
  municipios: { type: Array, default: () => [] },
  centros: { type: Array, default: () => [] }
})
defineEmits(['close'])

const showAllAreas = ref(false)
const showAllMunicipios = ref(false)

// Cálculo de tipos de centro
const tipoCounts = computed(() => {
  let hospitales = 0, especialidades = 0, salud = 0, consultorios = 0, otros = 0
  props.centros.forEach(c => {
    const tipo = (c.tipo_centro || c.center_type || '').toLowerCase()
    if (tipo.includes('hospital')) hospitales++
    else if (tipo.includes('especialidad')) especialidades++
    else if (tipo.includes('salud')) salud++
    else if (tipo.includes('consultorio')) consultorios++
    else otros++
  })
  return { hospitales, especialidades, salud, consultorios, otros }
})

// Cálculo de plazas
const plazasTotals = computed(() => {
  let ofertadas = 0, asignadas = 0, disponibles = 0
  props.centros.forEach(c => {
    ofertadas += Number(c.vacancies_offered) || 0
    asignadas += Number(c.vacancies_assigned) || 0
    // Calcula disponibles según campo o diferencia
    if (typeof c.vacancies_difference !== 'undefined') {
      disponibles += Number(c.vacancies_difference) || 0
    } else if (c.vacancies_offered && c.vacancies_assigned) {
      disponibles += (Number(c.vacancies_offered) - Number(c.vacancies_assigned))
    }
  })
  return { ofertadas, asignadas, disponibles }
})

// Verifica si hay filtros activos
const hasFilters = computed(() => {
  return props.areasSalud.length > 0 || props.municipios.length > 0
})
</script>