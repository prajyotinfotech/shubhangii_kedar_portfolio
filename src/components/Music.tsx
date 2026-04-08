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
  youtubeUrl?: string
  instaUrl?: string
  videoUrl?: string
  videoPlatform?: 'youtube' | 'instagram'
  imageUrl?: string
  gradient?: [string, string]
}

const getYouTubeEmbedUrl = (url: string) => {
  try {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)([^&?/]+)|youtu\.be\/([^&?/]+))/)
    const videoId = match?.[1] || match?.[2]
    if (videoId) return `https://www.youtube.com/embed/${videoId}`
  } catch (e) { /* ignore */ }
  return ''
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
      youtubeUrl: (release.links || []).find((l: any) => l.label?.toLowerCase() === 'youtube')?.href || release.youtubeUrl,
      instaUrl: (release.links || []).find((l: any) => l.label?.toLowerCase() === 'instagram')?.href || release.instaUrl,
      videoUrl: release.videoUrl,
      videoPlatform: release.videoPlatform,
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

  // Priority: CMS content first (manual), then Spotify API, then static fallback
  const data = (
    cmsReleases.length > 0 ? cmsReleases
    : releases.length > 0 ? releases
    : contextReleases.length > 0 ? contextReleases
    : fallbackReleases
  ).slice(0, 8)

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
          {data.map((release) => {
            const ytEmbed = release.videoPlatform === 'youtube' && release.videoUrl
              ? getYouTubeEmbedUrl(release.videoUrl) : ''
            const primaryLink = release.spotifyUrl || release.youtubeUrl || release.instaUrl

            return (
              <div className="music-card reveal-scale active" key={release.id}>
                <div className="album-art">
                  {ytEmbed ? (
                    <iframe
                      src={ytEmbed}
                      width="100%"
                      height="100%"
                      style={{ border: 'none', display: 'block', aspectRatio: '16/9' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={release.title}
                    />
                  ) : release.videoPlatform === 'instagram' && release.videoUrl ? (
                    <a href={release.videoUrl} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#E1306C,#F77737)', aspectRatio: '1/1', fontSize: '3rem' }}>
                      📷
                    </a>
                  ) : release.imageUrl ? (
                    <img src={release.imageUrl} alt={release.title} />
                  ) : release.gradient ? (
                    <AlbumArt gradient={release.gradient} />
                  ) : null}
                  {primaryLink && !ytEmbed && (
                    <a className="play-button" href={primaryLink} target="_blank" rel="noreferrer" aria-label="Play">
                      <svg width="50" height="50" viewBox="0 0 50 50">
                        <circle cx="25" cy="25" r="24" fill="rgba(255,255,255,0.9)" />
                        <polygon points="20,15 35,25 20,35" fill="#1DB954" />
                      </svg>
                    </a>
                  )}
                </div>
                <div className="music-info">
                  <h3 className="song-title">{release.title}</h3>
                  {release.artists && <p className="song-meta">{release.artists}</p>}
                  <div className="music-links" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {release.spotifyUrl && (
                      <a href={release.spotifyUrl} className="music-link" target="_blank" rel="noreferrer">Spotify</a>
                    )}
                    {release.youtubeUrl && (
                      <a href={release.youtubeUrl} className="music-link" target="_blank" rel="noreferrer">YouTube</a>
                    )}
                    {release.instaUrl && (
                      <a href={release.instaUrl} className="music-link" target="_blank" rel="noreferrer">Instagram</a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Music
