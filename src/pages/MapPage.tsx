import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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
  // Mock data for map markers
  const markers = [
    {
      id: '1',
      position: [43.2220, 76.8512] as [number, number],
      title: 'Нужны продукты питания',
      type: 'request',
      category: 'food',
    },
    {
      id: '2',
      position: [43.2566, 76.9286] as [number, number],
      title: 'Зимняя одежда для детей',
      type: 'request',
      category: 'clothing',
    },
    {
      id: '3',
      position: [43.2380, 76.9450] as [number, number],
      title: 'Приют "Верные друзья"',
      type: 'shelter',
      category: 'animal',
    },
    {
      id: '4',
      position: [43.2500, 76.9300] as [number, number],
      title: 'Дом престарелых "Забота"',
      type: 'shelter',
      category: 'human',
    },
  ]

  // Center of Almaty
  const center: [number, number] = [43.2380, 76.9450]

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">Карта помощи</h1>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold">
              Все
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300">
              Запросы помощи
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300">
              Приюты
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300">
              Волонтёры
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
                    {marker.type === 'request' ? 'Запрос помощи' : 'Приют'}
                  </p>
                  <button className="btn-primary text-xs py-1 px-3">
                    Подробнее
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
          <h3 className="font-bold mb-2 text-sm">Легенда</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
              <span>Запросы помощи</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span>Приюты</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
              <span>Волонтёры</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
