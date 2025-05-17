import { ref, computed, onMounted, watchEffect } from 'vue'

export default function usePlazas() {
  /* ────────────── Estado ────── */
  const features = ref([])
  const loading = ref(true)
  const error = ref(null)

  const selectedAreas = ref([])
  const selectedTipos = ref([])
  const selectedMunicipios = ref([])
  const showEmpty = ref(true)

  const municipioStats = computed(() => {
  if (!filteredData.value.length) return []
  const stats = {}

  filteredData.value.forEach(f => {
    const municipio = f.properties.municipio
    if (!stats[municipio]) stats[municipio] = 0
    stats[municipio] += f.properties.plazas
  })

  return Object.entries(stats).map(([municipio, plazas]) => ({ municipio, plazas }))
})


  /* ────────────── Carga de Datos ────── */
  async function fetchData() {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}centres.geojson`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

    const geo = await res.json()
    if (!geo.features || !Array.isArray(geo.features)) {
      throw new Error('Invalid GeoJSON format')
    }

    features.value = geo.features.map(f => {
      const p = f.properties
      return {
        geometry: f.geometry,
        properties: {
          // Propiedades originales nombradas explícitamente
          center_id: p.center_id ?? null,
          center_name: p.center_name ?? '—',
          center_type: p.center_type ?? 'Sin clasificar',
          department_code: p.department_code ?? '—',
          department_name: p.department_name ?? '—',
          latitude: p.latitude ?? null,
          longitude: p.longitude ?? null,
          municipality: p.municipality ?? 'Desconocido',
          municipality_code: p.municipality_code ?? null,
          postal_code: p.postal_code ?? '—',
          province: p.province ?? '—',
          street_name: p.street_name ?? '—',
          street_number: p.street_number ?? '—',
          vacancies_assigned: p.vacancies_assigned ?? 0,
          vacancies_difference: p.vacancies_difference ?? 0,
          vacancies_offered: p.vacancies_offered ?? 0,

          // Alias/fallbacks para filtros y popups
          centro: p.center_name ?? '—',
          municipio: p.municipality ?? 'Desconocido',
          area_salud: p.department_name ?? 'Desconocido',
          tipo_centro: p.center_type ?? 'Sin clasificar',
          plazas: p.vacancies_difference ?? 0
        }
      }
    })

    console.info(`✅ Datos cargados: ${features.value.length} elementos`)
  } catch (err) {
    error.value = err.message
    console.error(`❌ Error cargando datos: ${err.message}`)
  } finally {
    loading.value = false
  }
}

  /* ────────────── Computed Properties ───── */
  const healthAreas = computed(() => {
    const areas = [...new Set(features.value.map(f => f.properties.area_salud))]
    return areas.sort().map(area => ({ label: area, value: area }))
  })

  const tiposCentro = computed(() => {
    const tipos = [...new Set(features.value.map(f => f.properties.tipo_centro))]
    return tipos.sort().map(tipo => ({ label: tipo, value: tipo }))
  })

  const municipios = computed(() => {
    const municipios = [...new Set(features.value.map(f => f.properties.municipio))]
    return municipios.sort().map(municipio => ({ label: municipio, value: municipio }))
  })

  const filteredData = computed(() => {
    if (!features.value.length) return []

    return features.value.filter(f => {
      const { area_salud, tipo_centro, municipio, plazas } = f.properties

      const areaOk = !selectedAreas.value.length || selectedAreas.value.includes(area_salud)
      const tipoOk = !selectedTipos.value.length || selectedTipos.value.includes(tipo_centro)
      const muniOk = !selectedMunicipios.value.length || selectedMunicipios.value.includes(municipio)
      const plazasOk = showEmpty.value || plazas > 0

      return areaOk && tipoOk && muniOk && plazasOk
    })
  })

  /* ────────────── Watchers para Depuración ───── */
  watchEffect(() => {
    console.info('🔄 Filtros actualizados:')
    console.info('Áreas seleccionadas:', selectedAreas.value)
    console.info('Tipos seleccionados:', selectedTipos.value)
    console.info('Municipios seleccionados:', selectedMunicipios.value)
    console.info('Mostrar sin plazas:', showEmpty.value)
    console.info('🔄 Datos filtrados:', filteredData.value.length)
  })

  /* ────────────── Métodos de Modificación de Estado ───── */
  function setSelectedAreas(areas) {
    // Si viene [{label, value}], conviértelo a array de strings
    selectedAreas.value = areas.map(a => typeof a === 'string' ? a : a.value)
  }
  function setSelectedTipos(tipos) {
    selectedTipos.value = tipos.map(t => typeof t === 'string' ? t : t.value)
  }
  function setSelectedMunicipios(municipios) {
    selectedMunicipios.value = municipios.map(m => typeof m === 'string' ? m : m.value)
  }

  function setShowEmpty(value) {
    showEmpty.value = value
  }

  /* ────────────── Init ─────────────── */
  onMounted(fetchData)

  /* ────────────── API Pública ─────── */
  return {
    // Estado
    features,
    loading,
    error,

    // Datos calculados
    healthAreas,
    tiposCentro,
    municipios,
    filteredData,

    // Filtros
    selectedAreas,
    selectedTipos,
    selectedMunicipios,
    showEmpty,

    // Métodos de modificación de estado
    setSelectedAreas,
    setSelectedTipos,
    setSelectedMunicipios,
    setShowEmpty
  }
}
