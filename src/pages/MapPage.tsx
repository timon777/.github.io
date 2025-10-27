import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

export default function MapPage() {
  const { t } = useTranslation()

  // Mock data for map markers
  const markers = [
    {
      id: '1',
      position: [51.1694, 71.4491] as [number, number],
      title: 'Нужны продукты питания',
      type: 'request',
      category: 'food',
    },
    {
      id: '2',
      position: [51.1801, 71.4460] as [number, number],
      title: 'Зимняя одежда для детей',
      type: 'request',
      category: 'clothing',
    },
    {
      id: '3',
      position: [51.1605, 71.4704] as [number, number],
      title: 'Приют "Верные друзья"',
      type: 'shelter',
      category: 'animal',
    },
    {
      id: '4',
      position: [51.1289, 71.4303] as [number, number],
      title: 'Дом престарелых "Забота"',
      type: 'shelter',
      category: 'human',
    },
  ]

  // Center of Astana
  const center: [number, number] = [51.1694, 71.4491]

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">{t('map.title')}</h1>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold">
              {t('map.all')}
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300">
              {t('map.helpRequests')}
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300">
              {t('map.shelters')}
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300">
              {t('map.volunteers')}
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={12}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {markers.map((marker) => (
            <Marker key={marker.id} position={marker.position}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold mb-1">{marker.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {marker.type === 'request' ? t('map.helpRequest') : t('map.shelter')}
                  </p>
                  <button className="btn-primary text-xs py-1 px-3">
                    {t('map.details')}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
          <h3 className="font-bold mb-2 text-sm">{t('map.legend')}</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
              <span>{t('map.helpRequests')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span>{t('map.shelters')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
              <span>{t('map.volunteers')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
