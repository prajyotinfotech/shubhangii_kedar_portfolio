import { useState, useEffect } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
}

const OptimizedImage = ({
  src,
  alt,
  className = '',
  style = {},
  loading = 'lazy',
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>('')

  useEffect(() => {
    setImageSrc(src)
    setIsLoaded(false)
    setHasError(false)
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  if (hasError) {
    return (
      <div
        className={`optimized-image-error ${className}`}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--dark-200)',
          color: 'var(--text-dim)',
          fontSize: '14px'
        }}
      >
        Image failed to load
      </div>
    )
  }

  return (
    <div className={`optimized-image-wrapper ${className}`} style={{ position: 'relative', ...style }}>
      {!isLoaded && (
        <div
          className="optimized-image-skeleton"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, var(--dark-200) 25%, var(--light-color) 50%, var(--dark-200) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      )}
      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          ...style,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

export default OptimizedImage
