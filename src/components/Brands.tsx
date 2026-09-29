import { useContentContext } from '../contexts/ContentContext'
import { toBrand, brandHref, type Brand, type StoredBrand } from '../data/brands'
import './Brands.css'

// The slot inside a cell: the (already normalised) logo and the hover label.
// <a> when the brand has a URL. A brand without a logo prints its name.
export const BrandTile = ({ brand }: { brand: Brand }) => {
  const href = brandHref(brand)
  const cls = brand.image ? 'brand-slot' : 'brand-slot brand-slot--text'
  const inner = (
    <>
      {brand.image && <img src={brand.image} alt={brand.name} className="brand-logo" loading="lazy" decoding="async" />}
      <span className="brand-hover">{brand.name}</span>
    </>
  )
  return href ? (
    <a className={cls} href={href} target="_blank" rel="noopener noreferrer" aria-label={brand.name} title={brand.name}>
      {inner}
    </a>
  ) : (
    <span className={cls} aria-label={brand.name} title={brand.name}>
      {inner}
    </span>
  )
}

export const BrandsGrid = ({ brands }: { brands: Brand[] }) => (
  <div className="brands-grid">
    {brands.map((brand, i) => (
      <span key={brand.id || `${brand.name}-${i}`} className="brand-cell">
        <BrandTile brand={brand} />
      </span>
    ))}
  </div>
)

export const Brands: React.FC = () => {
  const { content } = useContentContext()
  const stored: StoredBrand[] = content?.brands || []
  const brands = stored.map(toBrand).filter((b) => b.name)

  if (!brands.length) return null

  return (
    <section id="brands" className="brands">
      <div className="container">
        <h2 className="section-title center">Brands We've Worked With</h2>
        <div className="title-decoration center"></div>
        <BrandsGrid brands={brands} />
      </div>
    </section>
  )
}

export default Brands
