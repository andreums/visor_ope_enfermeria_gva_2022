<template>
  <!-- the parent (App.vue) gives full height & width -->
  <div id="map" class="w-full h-full rounded-lg shadow-md"></div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/* ─── Plugins & CSS ───────────────────────────────────────────────────── */
import 'leaflet-fullscreen'
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
/* ─────────────────────────────────────────────────────────────────────── */

// Grupos de overlays
const hospitalesGroup = L.layerGroup();
const centrosSaludGroup = L.layerGroup();
const consultoriosGroup = L.layerGroup();
const otrosGroup = L.layerGroup();

const props = defineProps({
  filteredData: { type: Array, required: true }
})

const emit = defineEmits(['update:visibleCenters'])

/* State */
let map, clusterLayer

/* Custom default icon */
const DefaultIcon = L.icon({
  iconUrl   : 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl : 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize  : [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

// Define iconos personalizados por tipo
const iconHospital = L.icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/@tabler/icons@2.47.0/icons/outline/hospital.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})
const iconCentroSalud = L.icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/@tabler/icons@2.47.0/icons/outline/stethoscope.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})
const iconConsultorio = L.icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/@tabler/icons@2.47.0/icons/outline/home-heart.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})
const iconDefault = L.icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/@tabler/icons@2.47.0/icons/outline/map-pin.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})

function getIcon(tipo) {
  if (!tipo) return iconDefault
  const t = tipo.toLowerCase()
  if (t.includes('hospital')) return iconHospital
  if (t.includes('salud')) return iconCentroSalud
  if (t.includes('consultorio')) return iconConsultorio
  return iconDefault
}

// Asegúrate de tener FontAwesome cargado en tu proyecto (en tu index.html o main.js)

function getFAIcon(tipo) {
  let iconClass = 'fa-solid fa-location-dot';
  let color = '#2563eb';
  let bg = '#fff';

  if (tipo) {
    const t = tipo.toLowerCase();
    if (t.includes('hospital')) {
      iconClass = 'fa-solid fa-hospital';
      color = '#e11d48';
      bg = '#fff0f3';
    } else if (t.includes('salud')) {
      iconClass = 'fa-solid fa-user-doctor';
      color = '#2563eb';
      bg = '#eff6ff';
    } else if (t.includes('consultorio')) {
      iconClass = 'fa-solid fa-house-medical';
      color = '#059669';
      bg = '#ecfdf5';
    }
  }

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:38px;
        height:38px;
        background:${bg};
        border-radius:50% 50% 50% 50%/60% 60% 40% 40%;
        box-shadow:0 2px 6px rgba(0,0,0,0.15);
        display:flex;
        align-items:center;
        justify-content:center;
        border:2px solid ${color};
        position:relative;
      ">
        <i class="${iconClass}" style="font-size:1.3rem;color:${color};"></i>
        <div style="
          position:absolute;
          left:50%;
          bottom:-8px;
          transform:translateX(-50%);
          width:10px;
          height:10px;
          background:${color};
          border-radius:50%;
          box-shadow:0 1px 4px rgba(0,0,0,0.12);
        "></div>
      </div>
    `,
    iconSize: [38, 46],
    iconAnchor: [19, 42],
    popupAnchor: [0, -38]
  });
}

/* ─────────────── Setup Map on Mount ─────────────── */
onMounted(() => {
  // Create map
  map = L.map('map', {
    fullscreenControl: true
  }).setView([39.5, -0.75], 8)

  // Add WMS layers
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    detectRetina: true
  }).addTo(map);

  const pnoa = L.tileLayer.wms("https://www.ign.es/wms-inspire/pnoa-ma", {
    layers: 'OI.OrthoimageCoverage',
    format: 'image/png',
    transparent: true,
    attribution: '© Instituto Geográfico Nacional',
    version: '1.3.0',
    maxZoom: 19
  });

  const ignBase = L.tileLayer.wms("https://www.ign.es/wms-inspire/ign-base", {
    layers: 'IGNBaseTodo',
    format: 'image/png',
    transparent: true,
    attribution: '© Instituto Geográfico Nacional',
    version: '1.3.0',
    maxZoom: 19
  });

  const layerCodigosPostales = L.tileLayer.wms('https://www.cartociudad.es/wms-inspire/direcciones-ccpp', {
    layers: 'codigo-postal',
    format: 'image/png',
    transparent: false,
    opacity: 1,
    attribution: '© Instituto Geográfico Nacional',
    maxZoom: 19
  });

  const layerLimitesMunicipales = L.tileLayer.wms('https://www.ign.es/wms-inspire/unidades-administrativas', {
    layers: 'AU.AdministrativeBoundary',
    format: 'image/png',
    transparent: false,
    opacity: 0.35,
    attribution: '© Instituto Geográfico Nacional',
    maxZoom: 19
  });

  const layerIGNDirecciones = L.tileLayer.wms('https://www.cartociudad.es/wms-inspire/direcciones-ccpp', {
    layers: 'AD.Address',
    format: 'image/png',
    transparent: false,
    opacity: 0.35,
    attribution: '© Instituto Geográfico Nacional',
    maxZoom: 19
  });

  const layerDepartamentosSalud = L.tileLayer.wms('https://terramapas.icv.gva.es/15_SistemaValencianoSalud?', {
    layers: 'MapaSanitario.Departamentos',
    format: 'image/png',
    transparent: true,
    opacity: 0.6,
    attribution: '<a href="https://icv.gva.es" target="_blank">© Institut Cartogràfic Valencià</a>',
    version: '1.3.0',
    maxZoom: 19
  });

  const baseMaps = {
    "🗺️ OpenStreetMap": osm,
    "🛰️ Ortofoto PNOA": pnoa,
    "🧭 Base IGN": ignBase
  };

  const overlayMaps = {
    "📮 Códigos postales": layerCodigosPostales,
    "📍 Límites municipales": layerLimitesMunicipales,
    "🏠 Direcciones (IGN)": layerIGNDirecciones,
    "🏥 Departamentos de Salud (GVA)": layerDepartamentosSalud,
    "🏥 Hospitales": hospitalesGroup,
    "🩺 Centros de Salud": centrosSaludGroup,
    "🧑‍⚕️ Consultorios": consultoriosGroup,
    "📌 Otros": otrosGroup
  };

  L.control.layers(baseMaps, overlayMaps, {
    position: 'topright',
    collapsed: true
  }).addTo(map);

  L.control.zoom({ position: 'topright' }).addTo(map);
  // Create cluster layer
  clusterLayer = L.markerClusterGroup({
    disableClusteringAtZoom: 14,
    spiderfyOnMaxZoom: true
  })
  map.addLayer(clusterLayer)

  // Initial marker load
  updateMarkers(props.filteredData)

  // Escucha el movimiento del mapa
  map.on('moveend', emitVisibleCenters)

  // Llama una vez al cargar
  emitVisibleCenters()
})

function getCentersInBounds() {
  if (!map || !props.filteredData) return []
  const bounds = map.getBounds()
  return props.filteredData.filter(feature => {
    const [lng, lat] = feature.geometry.coordinates
    return bounds.contains([lat, lng])
  })
}

function emitVisibleCenters() {
  const visibles = getCentersInBounds()
  emit('update:visibleCenters', visibles.map(f => f.properties))
}

/* ─────────────── Watch for Filtered Data Changes ─────────────── */
watch(
  () => props.filteredData,
  (newData) => updateMarkers(newData),
  { deep: true }
)

/* ─────────────── Update Markers Function ─────────────── */
function updateMarkers(data) {
  if (!map || !clusterLayer) return

  clusterLayer.clearLayers()

  if (!data.length) {
    console.warn('⚠️ No data to display.')
    return
  }

  data.forEach(feature => {
    const p = feature.properties
    const [lng, lat] = feature.geometry.coordinates

    const popupContent = `
      <div style="min-width:260px">
        <div class="font-bold text-base mb-1">${p.centro ?? p.center_name ?? '—'}</div>
        <div class="text-xs text-gray-500 mb-2">${p.center_id ? 'Código: ' + p.center_id : ''}</div>
        <div class="mb-2 text-xs text-gray-700">
          ${p.street_name ?? '—'}
          ${p.street_number ? ', ' + p.street_number : ''}
          ${p.postal_code ? ' · ' + p.postal_code : ''}
          ${(p.municipio ?? p.municipality) ? ' · ' + (p.municipio ?? p.municipality) : ''}
          ${p.province ? ' · ' + p.province : ''}
        </div>
        <div class="flex flex-wrap gap-2 mb-2">
          <span class="inline-block bg-blue-100 text-blue-800 text-xs rounded px-2 py-1">${p.tipo_centro ?? p.center_type ?? '—'}</span>
          <span class="inline-block bg-green-100 text-green-800 text-xs rounded px-2 py-1">${p.area_salud ?? p.department_name ?? '—'}</span>
        </div>
        <div class="flex flex-wrap gap-2 mb-2">
          <span class="inline-block bg-gray-100 text-gray-800 text-xs rounded px-2 py-1">Ofertadas: <b>${p.vacancies_offered ?? '—'}</b></span>
          <span class="inline-block bg-gray-100 text-gray-800 text-xs rounded px-2 py-1">Asignadas: <b>${p.vacancies_assigned ?? '—'}</b></span>
          <span class="inline-block bg-yellow-100 text-yellow-800 text-xs rounded px-2 py-1">Libres: <b>${p.vacancies_difference ?? '—'}</b></span>
        </div>
      </div>
    `

    // Usa un marcador con icono según tipo de centro
    const marker = L.marker([lat, lng], {
      icon: getFAIcon(p.tipo_centro ?? p.center_type)
    })
      .bindTooltip(p.centro ?? p.center_name ?? '—', { sticky: true })
      .bindPopup(popupContent)

    clusterLayer.addLayer(marker)
  })

  if (clusterLayer.getBounds().isValid()) {
    map.fitBounds(clusterLayer.getBounds(), { padding: [50, 50] })
  }
}
</script>

<style scoped>
/* ensure the map canvas fills its parent flex/grid cell */
#map {
  inset: 0;
}
</style>
