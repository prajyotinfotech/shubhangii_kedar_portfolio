import { useEffect, useMemo, useState } from 'react'
import { musicReleases } from '../data/content'
import { fetchPlaylistTracks } from '../services/spotifyService'
import { SPOTIFY_LATEST_RELEASE_PLAYLIST_ID } from '../config/spotify'
import { useSpotify } from '../contexts/SpotifyContext'
import { useContentContext } from '../contexts/ContentContext'

const AlbumArt: React.FC<{ gradient: [string, string] }> = ({ gradient }) => (
  <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`album-${gradient[0]}-${gradient[1]}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={gradient[0]} />
        <stop offset="100%" stopColor={gradient[1]} />
      </linearGradient>
    </defs>
    <rect width="300" height="300" fill={`url(#album-${gradient[0]}-${gradient[1]})`} />
    <circle cx="150" cy="150" r="80" fill="rgba(255,255,255,0.1)" />
    <circle cx="150" cy="150" r="20" fill="rgba(255,255,255,0.3)" />
  </svg>
)

type ReleaseCard = {
  id: string
  title: string
  artists: string
  releaseDateLabel: string
  spotifyUrl?: string
  imageUrl?: string
  gradient?: [string, string]
}

const formatReleaseDate = (value?: string) => {
  if (!value) return 'Release date unavailable'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed)
}

export const Music: React.FC = () => {
  const { topTracks } = useSpotify()
  const { content } = useContentContext()
  const [releases, setReleases] = useState<ReleaseCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 1) Prefer context topTracks (already fetched for Playlist section)
  const contextReleases = useMemo<ReleaseCard[]>(() => {
    if (!topTracks || topTracks.length === 0) return []
    return topTracks
      .map((track: any) => {
        const date = track?.album?.release_date || track?.release_date
        return {
          id: track?.id || track?.uri,
          title: track?.name ?? 'Untitled',
          artists: (track?.artists || []).map((a: any) => a.name).join(', '),
          releaseDateLabel: formatReleaseDate(date),
          spotifyUrl: track?.external_urls?.spotify,
          imageUrl: track?.album?.images?.[0]?.url,
        } as ReleaseCard
      })
      .sort((a, b) => new Date(b.releaseDateLabel).getTime() - new Date(a.releaseDateLabel).getTime())
      .slice(0, 5)
  }, [topTracks])

  // 2) CMS releases from admin panel (content.json / Gist)
  const cmsReleases = useMemo<ReleaseCard[]>(() => {
    const cms = content?.musicReleases
    if (!cms || !Array.isArray(cms) || cms.length === 0) return []
    return cms.map((release: any, idx: number) => ({
      id: release.id || `cms-${release.title}-${idx}`,
      title: release.title,
      artists: release.meta || '',
      releaseDateLabel: release.meta || '',
      spotifyUrl: (release.links || []).find((l: any) => l.label?.toLowerCase() === 'spotify')?.href,
      imageUrl: release.coverImage || undefined,
      gradient: release.gradient,
    }))
  }, [content?.musicReleases])

  // 3) If Spotify context empty, try playlist fetch
  useEffect(() => {
    let cancelled = false
    const maybeFetch = async () => {
      if (contextReleases.length > 0) {
        setReleases(contextReleases)
        setLoading(false)
        return
      }
      const playlistId = SPOTIFY_LATEST_RELEASE_PLAYLIST_ID
      if (!playlistId || playlistId === 'YOUR_PLAYLIST_ID_HERE') {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const items = await fetchPlaylistTracks(playlistId)
        if (cancelled) return
        const normalized: ReleaseCard[] = (items ?? [])
          .map((item: any) => ({ track: item?.track, added_at: item?.added_at }))
          .filter(Boolean)
          .map(({ track, added_at }: any) => {
            const dateSource = track?.album?.release_date || track?.release_date || added_at
            return {
              id: track?.id || track?.uri,
              title: track?.name ?? 'Untitled',
              artists: (track?.artists || []).map((a: any) => a.name).join(', '),
              releaseDateLabel: formatReleaseDate(dateSource),
              spotifyUrl: track?.external_urls?.spotify,
              imageUrl: track?.album?.images?.[0]?.url,
            } as ReleaseCard
          })
          .sort((a, b) => new Date(b.releaseDateLabel).getTime() - new Date(a.releaseDateLabel).getTime())
          .slice(0, 5)
        setReleases(normalized)
      } catch (err: any) {
        if (cancelled) return
        setError(err?.message || 'Failed to load releases from Spotify')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    maybeFetch()
    return () => {
      cancelled = true
    }
  }, [contextReleases])

  // 4) Static fallback from code
  const fallbackReleases = useMemo<ReleaseCard[]>(
    () =>
      musicReleases.map((release, idx) => ({
        id: `${release.title}-${idx}`,
        title: release.title,
        artists: release.meta,
        releaseDateLabel: release.meta,
        spotifyUrl: release.links.find((link) => link.label.toLowerCase() === 'spotify')?.href,
        gradient: release.gradient,
      })),
    []
  )

  // Priority: Spotify API > CMS content > static fallback
  const data = (
    releases.length > 0 ? releases
    : contextReleases.length > 0 ? contextReleases
    : cmsReleases.length > 0 ? cmsReleases
    : fallbackReleases
  ).slice(0, 4)

  return (
    <section id="music" className="music">
      <div className="container">
        <h2 className="section-title center">Latest Releases</h2>
        <div className="title-decoration center"></div>
        {loading && (
          <div className="loading" style={{ textAlign: 'center', marginTop: '1rem' }}>
            Fetching the newest drops from Spotify...
          </div>
        )}
        {error && (
          <div className="error" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <div className="music-grid">
          {data.map((release) => (
            <div className="music-card reveal-scale active" key={release.id}>
              <div className="album-art">
                {release.imageUrl ? (
                  <img src={release.imageUrl} alt={release.title} />
                ) : release.gradient ? (
                  <AlbumArt gradient={release.gradient} />
                ) : null}
                {release.spotifyUrl && (
                  <a className="play-button" href={release.spotifyUrl} target="_blank" rel="noreferrer" aria-label="Play on Spotify">
                    <svg width="50" height="50" viewBox="0 0 50 50">
                      <circle cx="25" cy="25" r="24" fill="rgba(255,255,255,0.9)" />
                      <polygon points="20,15 35,25 20,35" fill="#1DB954" />
                    </svg>
                  </a>
                )}
              </div>
              <div className="music-info">
                <h3 className="song-title">{release.title}</h3>
                <p className="song-meta">{release.artists}</p>
                <p className="song-meta" style={{ opacity: 0.8 }}>Released {release.releaseDateLabel}</p>
                {release.spotifyUrl && (
                  <div className="music-links">
                    <a href={release.spotifyUrl} className="music-link" target="_blank" rel="noreferrer">
                      Open in Spotify
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Music
