import raw from '../inventory_close_gaurd_seed.json'
import type { SeedData } from './types'

// Single source of truth. The filename's "gaurd" spelling is intentional —
// never rename the data file (see docs/SOP.md).
export const seed = raw as SeedData
