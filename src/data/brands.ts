// "Brands we've worked with" — ported from the CINFINI site (2026-09-29,
// docs/BRANDS_SECTION_HANDOVER.md in cinfini-website). Evenness comes from
// the ASSETS: every logo is normalised into one square canvas on upload
// (`services/logoNormalize.ts`), the grid is a fixed number of square cells
// per row, and nothing is adjustable.

export type Brand = {
  id?: string
  name: string
  image?: string // Cloudinary URL of the normalised 400px PNG
  url?: string // optional outbound link; tile becomes <a target=_blank>
}

// Stored shape may also be a plain string (name-only brand). Migrate on read.
export type StoredBrand = string | Brand

export const LOGO_CANVAS_PX = 400 // crisp on a 2x screen at ~180px cells, < 64KB as PNG
export const LOGO_INK_BOX = { w: 0.74, h: 0.44 } as const

export const toBrand = (b: StoredBrand): Brand => (typeof b === 'string' ? { name: b } : b)

export const brandHref = (b: Brand): string | undefined => b.url || undefined

export const isHttpUrl = (value: string): boolean => /^https?:\/\/\S+$/i.test(value.trim())
