import { LOGO_CANVAS_PX, LOGO_INK_BOX } from '../data/brands'

export type Bounds = { x: number; y: number; w: number; h: number }

// Pure: the smallest box holding every pixel with alpha above `threshold`
// (0–255); undefined when the picture is fully transparent.
export const alphaBounds = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold = 8,
): Bounds | undefined => {
  let top = height
  let left = width
  let bottom = -1
  let right = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > threshold) {
        if (y < top) top = y
        if (y > bottom) bottom = y
        if (x < left) left = x
        if (x > right) right = x
      }
    }
  }
  return bottom < 0 ? undefined : { x: left, y: top, w: right - left + 1, h: bottom - top + 1 }
}

// Pure: the ink box (w×h) fitted inside a square of `side`, per LOGO_INK_BOX.
export const fittedInkSize = (w: number, h: number, side = LOGO_CANVAS_PX): { w: number; h: number } => {
  const maxW = side * LOGO_INK_BOX.w
  const maxH = side * LOGO_INK_BOX.h
  const scale = Math.min(maxW / w, maxH / h)
  return { w: Math.round(w * scale), h: Math.round(h * scale) }
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image failed to load'))
    img.src = src
  })

// Normalise a logo the way the reference site's designer did by hand: crop to
// the ink, then paint it centred into a fixed square canvas so the ink fits
// inside LOGO_INK_BOX — wordmarks hit the width limit, symbols the height
// limit, so every logo reads as the same weight. Returns a PNG data URL.
// Throws when the picture cannot be read (caller decides what to do).
export const normalizeLogo = async (src: string): Promise<string> => {
  const img = await loadImage(src)
  const w = img.naturalWidth
  const h = img.naturalHeight
  if (!w || !h) throw new Error('image has no size')

  const scratch = document.createElement('canvas')
  scratch.width = w
  scratch.height = h
  const sctx = scratch.getContext('2d', { willReadFrequently: true })
  if (!sctx) throw new Error('canvas unavailable')
  sctx.drawImage(img, 0, 0)
  const b = alphaBounds(sctx.getImageData(0, 0, w, h).data, w, h) ?? { x: 0, y: 0, w, h }
  const fit = fittedInkSize(b.w, b.h)

  const out = document.createElement('canvas')
  out.width = LOGO_CANVAS_PX
  out.height = LOGO_CANVAS_PX
  const octx = out.getContext('2d')
  if (!octx) throw new Error('canvas unavailable')
  octx.imageSmoothingQuality = 'high'
  octx.drawImage(
    scratch, b.x, b.y, b.w, b.h,
    (LOGO_CANVAS_PX - fit.w) / 2, (LOGO_CANVAS_PX - fit.h) / 2, fit.w, fit.h,
  )
  return out.toDataURL('image/png')
}

// Pure-ish: a PNG data URL → File, ready for the site's image upload.
export const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const [head, body] = dataUrl.split(',')
  const mime = head.match(/data:([^;]+)/)?.[1] ?? 'image/png'
  const bin = atob(body)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new File([bytes], filename, { type: mime })
}

// Upload file → normalised PNG File. Object URL is revoked either way.
export const normalizeLogoFile = async (file: File): Promise<File> => {
  const objectUrl = URL.createObjectURL(file)
  try {
    const png = await normalizeLogo(objectUrl)
    const base = file.name.replace(/\.[^.]+$/, '') || 'logo'
    return dataUrlToFile(png, `${base}-logo.png`)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
