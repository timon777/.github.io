import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface City {
  id: string
  name: string
  nameRu: string
  nameKk: string
  nameEn: string
  latitude: number
  longitude: number
  region: string
}

export const CITIES: City[] = [
  {
    id: 'astana',
    name: 'Астана',
    nameRu: 'Астана',
    nameKk: 'Астана',
    nameEn: 'Astana',
    latitude: 51.1694,
    longitude: 71.4491,
    region: 'Акмолинская область'
  },
  {
    id: 'almaty',
    name: 'Алматы',
    nameRu: 'Алматы',
    nameKk: 'Алматы',
    nameEn: 'Almaty',
    latitude: 43.2380,
    longitude: 76.9450,
    region: 'Алматинская область'
  },
  {
    id: 'aktobe',
    name: 'Актобе',
    nameRu: 'Актобе',
    nameKk: 'Ақтөбе',
    nameEn: 'Aktobe',
    latitude: 50.2839,
    longitude: 57.1670,
    region: 'Актюбинская область'
  }
]

interface LocationState {
  selectedCity: City | null
  setCity: (city: City) => void
  getCityName: (lang: string) => string
  cities: City[]
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      selectedCity: CITIES[0], // По умолчанию Астана
      cities: CITIES,

      setCity: (city: City) => {
        set({ selectedCity: city })
      },

      getCityName: (lang: string) => {
        const city = get().selectedCity
        if (!city) return ''
        
        switch (lang) {
          case 'kk':
            return city.nameKk
          case 'en':
            return city.nameEn
          default:
            return city.nameRu
        }
      }
    }),
    {
      name: 'location-storage',
      partialize: (state) => ({ selectedCity: state.selectedCity })
    }
  )
)
