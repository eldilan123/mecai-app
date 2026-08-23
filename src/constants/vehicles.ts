import type {
  VehicleBrand,
  VehicleModel,
  VehicleTypeOption,
  VehicleTypeSlug,
} from '@/types/vehicle.types'

/**
 * Catálogo curado de tipos, marcas y modelos (HU-08).
 *
 * No pretende ser exhaustivo: es la lista de lo que la gente realmente maneja
 * en Bogotá y ciudades intermedias. Un catálogo completo vuelve el picker
 * inusable, y el flujo permite escribir marca/modelo a mano si no está acá.
 *
 * Los `name` son lo que se guarda en la BD; los `slug` sólo viven en el cliente
 * para llavear listas y relacionar modelo → marca.
 */

/** Año más antiguo aceptado. Coincide con el CHECK de `vehicles.year`. */
export const VEHICLE_YEAR_MIN = 1990

/** Los 5 tipos, ordenados de más a menos común en el parque automotor local. */
export const VEHICLE_TYPES: VehicleTypeOption[] = [
  {
    slug: 'car',
    labelEs: 'Carro',
    iconName: 'Car',
    description: 'Sedán, hatchback, coupé',
  },
  {
    slug: 'motorcycle',
    labelEs: 'Moto',
    iconName: 'Bike',
    description: 'Cualquier motocicleta',
  },
  {
    slug: 'suv',
    labelEs: 'SUV',
    iconName: 'CarFront',
    description: 'Camioneta alta tipo SUV',
  },
  {
    slug: 'truck',
    labelEs: 'Camioneta',
    iconName: 'Truck',
    description: 'Pickup, 4x4 de platón',
  },
  {
    slug: 'van',
    labelEs: 'Van',
    iconName: 'Bus',
    description: 'Van familiar o carga',
  },
]

export const VEHICLE_BRANDS: VehicleBrand[] = [
  { slug: 'akt', name: 'AKT', types: ['motorcycle'] },
  { slug: 'bajaj', name: 'Bajaj', types: ['motorcycle'] },
  { slug: 'chevrolet', name: 'Chevrolet', types: ['car', 'suv', 'truck', 'van'] },
  { slug: 'ford', name: 'Ford', types: ['car', 'suv', 'truck', 'van'] },
  // Honda y Suzuki son las dos marcas que cruzan carros y motos.
  { slug: 'honda', name: 'Honda', types: ['car', 'suv', 'motorcycle'] },
  { slug: 'hyundai', name: 'Hyundai', types: ['car', 'suv', 'van'] },
  { slug: 'kia', name: 'Kia', types: ['car', 'suv', 'van'] },
  { slug: 'mazda', name: 'Mazda', types: ['car', 'suv'] },
  { slug: 'nissan', name: 'Nissan', types: ['car', 'suv', 'truck', 'van'] },
  { slug: 'renault', name: 'Renault', types: ['car', 'suv', 'van'] },
  { slug: 'royal-enfield', name: 'Royal Enfield', types: ['motorcycle'] },
  { slug: 'suzuki', name: 'Suzuki', types: ['car', 'suv', 'motorcycle'] },
  { slug: 'toyota', name: 'Toyota', types: ['car', 'suv', 'truck', 'van'] },
  { slug: 'tvs', name: 'TVS', types: ['motorcycle'] },
  { slug: 'volkswagen', name: 'Volkswagen', types: ['car', 'suv', 'van'] },
  { slug: 'yamaha', name: 'Yamaha', types: ['motorcycle'] },
]

/**
 * Convierte un nombre de modelo en slug kebab-case.
 *
 * Se calcula en vez de escribirse a mano para que no haya typos entre `name` y
 * `slug` en una lista de este tamano. 'V-Strom 250 SX' -> 'v-strom-250-sx'.
 */
function toSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Expande `{ marca, tipo, [nombres] }` a los objetos `VehicleModel` finales. */
function models(brandSlug: string, type: VehicleTypeSlug, names: string[]): VehicleModel[] {
  return names.map((name) => ({ slug: toSlug(name), name, brandSlug, type }))
}

export const VEHICLE_MODELS: VehicleModel[] = [
  // Chevrolet
  ...models('chevrolet', 'car', [
    'Spark',
    'Spark GT',
    'Spark Life',
    'Beat',
    'Sail',
    'Aveo',
    'Aveo Emotion',
    'Onix',
    'Onix Turbo',
    'Joy',
    'Optra',
    'Cruze',
  ]),
  ...models('chevrolet', 'suv', ['Tracker', 'Captiva', 'Groove', 'Equinox']),
  ...models('chevrolet', 'truck', ['D-Max', 'Colorado', 'Montana', 'LUV']),
  ...models('chevrolet', 'van', ['N300', 'N400', 'Combo']),

  // Renault
  ...models('renault', 'car', ['Logan', 'Sandero', 'Stepway', 'Kwid', 'Clio', 'Symbol', 'Twingo']),
  ...models('renault', 'suv', ['Duster', 'Captur', 'Koleos', 'Kardian']),
  ...models('renault', 'van', ['Kangoo', 'Trafic']),

  // Kia
  ...models('kia', 'car', ['Picanto', 'Rio', 'Soluto', 'Cerato', 'K3']),
  ...models('kia', 'suv', ['Sportage', 'Seltos', 'Sonet', 'Sorento']),
  ...models('kia', 'van', ['Carnival', 'Carens']),

  // Mazda
  ...models('mazda', 'car', ['Mazda 2', 'Mazda 3', 'Mazda 6', 'Allegro']),
  ...models('mazda', 'suv', ['CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-90']),

  // Toyota
  ...models('toyota', 'car', ['Corolla', 'Yaris', 'Etios', 'Camry']),
  ...models('toyota', 'suv', [
    'Prado',
    'Fortuner',
    'RAV4',
    'Corolla Cross',
    'Land Cruiser',
    '4Runner',
  ]),
  ...models('toyota', 'truck', ['Hilux', 'Land Cruiser Pick Up']),
  ...models('toyota', 'van', ['Hiace']),

  // Nissan
  ...models('nissan', 'car', ['March', 'Versa', 'Sentra', 'Tiida', 'Almera']),
  ...models('nissan', 'suv', ['Kicks', 'Qashqai', 'X-Trail', 'Pathfinder']),
  ...models('nissan', 'truck', ['Frontier', 'NP300']),
  ...models('nissan', 'van', ['Urvan']),

  // Hyundai
  ...models('hyundai', 'car', ['Atos', 'i10', 'Grand i10', 'i20', 'Accent', 'Elantra']),
  ...models('hyundai', 'suv', ['Creta', 'Tucson', 'Venue', 'Kona', 'Santa Fe']),
  ...models('hyundai', 'van', ['H1', 'Starex']),

  // Volkswagen
  ...models('volkswagen', 'car', ['Gol', 'Polo', 'Voyage', 'Virtus', 'Jetta', 'Golf']),
  ...models('volkswagen', 'suv', ['T-Cross', 'Nivus', 'Taos', 'Tiguan']),
  ...models('volkswagen', 'van', ['Transporter', 'Caddy']),

  // Ford
  ...models('ford', 'car', ['Fiesta', 'Focus', 'Escort']),
  ...models('ford', 'suv', ['EcoSport', 'Escape', 'Territory', 'Bronco Sport', 'Explorer']),
  ...models('ford', 'truck', ['Ranger', 'F-150']),
  ...models('ford', 'van', ['Transit']),

  // Suzuki
  ...models('suzuki', 'car', ['Alto', 'Celerio', 'Swift', 'Baleno', 'Ciaz']),
  ...models('suzuki', 'suv', ['Vitara', 'Grand Vitara', 'S-Cross', 'Jimny', 'Fronx']),
  ...models('suzuki', 'motorcycle', [
    'GN 125',
    'Gixxer 150',
    'Gixxer 250',
    'Gixxer 250 SF',
    'GSX-S150',
    'Burgman 125',
    'Address 125',
    'V-Strom 250 SX',
    'V-Strom 650',
    'DR 650',
  ]),

  // Honda
  ...models('honda', 'car', ['Civic', 'City', 'Accord']),
  ...models('honda', 'suv', ['HR-V', 'BR-V', 'CR-V', 'ZR-V']),
  ...models('honda', 'motorcycle', [
    'CB 110',
    'CB 125F',
    'CB 190R',
    'XR 150L',
    'XRE 300',
    'CBR 250R',
    'Navi',
    'Dio',
    'Elite 125',
  ]),

  // Yamaha
  ...models('yamaha', 'motorcycle', [
    'Crypton',
    'YBR 125',
    'FZ 2.0',
    'FZ 2.5',
    'FZ 25',
    'XTZ 125',
    'XTZ 250',
    'MT-03',
    'R3',
    'NMAX 155',
    'BWS 125',
  ]),

  // AKT
  ...models('akt', 'motorcycle', [
    'AK 125',
    'NKD 125',
    'Dynamic 125',
    'Flex 125',
    'Evo 125',
    'TT 150',
    'RTX 150',
    'TTR 180',
  ]),

  // Bajaj
  ...models('bajaj', 'motorcycle', [
    'Boxer CT 100',
    'Boxer CT 125',
    'Platina 100',
    'Discover 125',
    'Pulsar 125',
    'Pulsar NS 160',
    'Pulsar NS 200',
    'Dominar 400',
  ]),

  // TVS
  ...models('tvs', 'motorcycle', [
    'Sport 100',
    'Neo 110',
    'Star HLX 125',
    'Raider 125',
    'Ntorq 125',
    'Stryker 125',
    'Apache RTR 160',
    'Apache RTR 200',
  ]),

  // Royal Enfield
  ...models('royal-enfield', 'motorcycle', [
    'Hunter 350',
    'Classic 350',
    'Meteor 350',
    'Scram 411',
    'Himalayan 411',
    'Himalayan 450',
    'Interceptor 650',
    'Continental GT 650',
  ]),
]

/** Orden alfabético con locale español, para que acentos y "ñ" caigan donde el usuario espera. */
function byName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name, 'es')
}

/** Marcas que cubren `type`, alfabéticas. Alimenta el paso 2 del flujo. */
export function getBrandsForType(type: VehicleTypeSlug): VehicleBrand[] {
  return VEHICLE_BRANDS.filter((brand) => brand.types.includes(type)).sort(byName)
}

/** Modelos de una marca dentro de un tipo, alfabéticos. Alimenta el paso 3. */
export function getModelsForBrand(brandSlug: string, type: VehicleTypeSlug): VehicleModel[] {
  return VEHICLE_MODELS.filter(
    (model) => model.brandSlug === brandSlug && model.type === type
  ).sort(byName)
}

/**
 * Rango de años aceptado por el formulario.
 *
 * El `max` es el año siguiente al actual, igual que el CHECK de `vehicles.year`
 * en Supabase: los modelos nuevos se venden con el año entrante.
 */
export function getYearRange(): { min: number; max: number } {
  return { min: VEHICLE_YEAR_MIN, max: new Date().getFullYear() + 1 }
}
