/**
 * ODCAF - Open Database of Cultural and Art Facilities
 * TypeScript type definitions
 */

/**
 * Raw facility record from CSV
 */
export interface OdcafFacility {
	index: number
	facilityName: string
	sourceFacilityType: string
	odcafFacilityType: string
	provider: string
	unit: string
	streetNo: string
	streetName: string
	postalCode: string
	city: string
	provTerr: string
	sourceFormatAddress: string
	csdName: string
	csduid: string
	pruid: string
	latitude: number | null
	longitude: number | null
}

/**
 * Facility types in ODCAF dataset
 */
export type OdcafFacilityType =
	| 'museum'
	| 'gallery'
	| 'library'
	| 'theatre'
	| 'heritage or historic site'
	| 'community cultural centre'
	| 'performing arts facility'
	| 'archive'
	| 'other'

/**
 * Canadian provinces and territories
 */
export type Province = 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT' | 'NU' | 'ON' | 'PE' | 'QC' | 'SK' | 'YT'

/**
 * Search result containing IDs and preview
 */
export interface SearchResult {
	ids: number[]
	totalCount: number
	preview: FacilityPreview[]
}

/**
 * Facility preview for search results
 */
export interface FacilityPreview {
	id: number
	name: string
	type: string
	city: string
	province: string
}

/**
 * Full facility details for fetch
 */
export interface FetchResult {
	id: number
	facility: OdcafFacility
	content: string
}

/**
 * Filter parameters
 */
export interface FilterParams {
	province?: string
	city?: string
	facilityType?: string
	limit?: number
}

/**
 * Statistics result
 */
export interface StatsResult {
	totalFacilities: number
	byType: Record<string, number>
	byProvince: Record<string, number>
	topCities: Array<{ city: string; count: number }>
}

/**
 * CSV column mapping from raw to typed
 */
export const CSV_COLUMN_MAP = {
	Index: 'index',
	Facility_Name: 'facilityName',
	Source_Facility_Type: 'sourceFacilityType',
	ODCAF_Facility_Type: 'odcafFacilityType',
	Provider: 'provider',
	Unit: 'unit',
	Street_No: 'streetNo',
	Street_Name: 'streetName',
	Postal_Code: 'postalCode',
	City: 'city',
	Prov_Terr: 'provTerr',
	Source_Format_Address: 'sourceFormatAddress',
	CSD_Name: 'csdName',
	CSDUID: 'csduid',
	PRUID: 'pruid',
	Latitude: 'latitude',
	Longitude: 'longitude',
} as const
