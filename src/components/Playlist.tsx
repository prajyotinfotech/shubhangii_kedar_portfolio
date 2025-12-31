import { useEffect, useState } from 'react'
import { useSpotify } from '../contexts/SpotifyContext'
import { useAuth } from '../contexts/AuthContext'
import { useWebPlayback } from '../contexts/SpotifyWebPlaybackContext'
import { formatDuration } from '../utils/formatDuration'
import coverA from '../assets/3a.png'
import coverB from '../assets/6a.png'
import coverC from '../assets/1.png'

export const Playlist: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const { topTracks, artist, loading, error } = useSpotify()
  const { accessToken, login } = useAuth()
  const { deviceId, playerReady } = useWebPlayback()
  const web = useWebPlayback()

  useEffect(() => {
    const onState = (e: Event) => {
      const detail = (e as CustomEvent).detail as { isPlaying: boolean; trackIndex: number }
      if (!detail) return
      setIsPlaying(detail.isPlaying)
      setCurrentIndex(detail.trackIndex)
    }
    window.addEventListener('miniPlayerState' as any, onState)
    return () => window.removeEventListener('miniPlayerState' as any, onState)
  }, [])

  // When using SDK, keep the playlist selection in sync by matching the SDK current track URI
  useEffect(() => {
    if (!web?.track || !topTracks?.length) return
    const idx = topTracks.findIndex((t: any) => t?.uri === web.track?.uri)
    if (idx >= 0 && idx !== currentIndex) setCurrentIndex(idx)
  }, [web?.track?.uri, topTracks, currentIndex])

  if (loading) {
    return (
      <section id="playlist" className="playlist">
        <div className="container">
          <div className="loading">Loading music data...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="playlist" className="playlist">
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </section>
    )
  }

  const coverList = [coverA, coverB, coverC]
  const activeTrack = topTracks[currentIndex] ?? topTracks[0]
  // If SDK is active, prefer its current track/cover for the header
  const usingSdk = !!(web?.playerReady && web.track)
  const headerCover = usingSdk ? web.track?.cover : activeTrack?.album?.images?.[0]?.url
  const coverUrl = headerCover || coverList[currentIndex % coverList.length]

  const playViaMiniPlayer = async (index: number) => {
    const t = topTracks[index]
    if (!t) return
    // If authenticated and device is ready, play on Web Playback SDK device using full track URI
    if (accessToken && playerReady && deviceId && t.uri) {
      try {
        // Transfer playback to our device (ensures control)
        await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_ids: [deviceId], play: true }),
        })
        // Build a play queue (full list) so next/prev work reliably
        const uris: string[] = topTracks.map((x: any) => x?.uri).filter(Boolean)
        const offset = Math.max(0, Math.min(uris.length - 1, index))
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ uris, offset: { position: offset } }),
        })
        setCurrentIndex(index)
        setIsPlaying(true)
        return
      } catch (e) {
        console.error('Failed to start Spotify playback', e)
      }
    }
    // Fallback: 30s preview via mini-player (no auth needed)
    if (t.preview_url) {
      const evt = new CustomEvent('playTrack', {
        detail: {
          trackIndex: index,
          track: {
            title: t.name,
            artist: t.artists?.map((a: any) => a.name).join(', '),
            coverSrc: t.album?.images?.[0]?.url,
            previewUrl: t.preview_url,
          },
        },
      })
      window.dispatchEvent(evt)
      setCurrentIndex(index)
      setIsPlaying(true)
      return
    }
    // Last resort: open on Spotify
    if (t.external_urls?.spotify) {
      window.open(t.external_urls.spotify, '_blank', 'noopener,noreferrer')
    }
  }

  const togglePlayPause = () => {
    const evt = new CustomEvent('togglePlayPause')
    window.dispatchEvent(evt)
    setIsPlaying((p) => !p)
  }

  return (
    <section id="playlist" className="playlist">
      <div className="container">
        <div className="playlist-header reveal-left active">
          <div className="album-visual" style={{ ['--disc-color' as any]: '#5A8DEE' }}>
            <div className={`disc${(usingSdk ? web.isPlaying : isPlaying) ? ' spinning' : ''}`} aria-hidden="true">
              <div className="disc-grooves" />
              <div className="disc-hole" />
              <div className="disc-cover" style={{ backgroundImage: `url(${coverUrl})` }} />
            </div>
          </div>
          <div className="playlist-meta">
            <p className="playlist-type">Top Tracks</p>
            <h2 className="playlist-title">{artist?.name || 'Artist'}</h2>
            <p className="playlist-desc">{artist?.genres?.slice(0, 3).map((g: string) => g[0]?.toUpperCase() + g.slice(1)).join(' • ')}</p>
            <div className="playlist-actions">
              <button
                className="btn btn-primary play-big"
                onClick={() => ((usingSdk ? web.isPlaying : isPlaying) ? (usingSdk ? web.togglePlay() : togglePlayPause()) : playViaMiniPlayer(currentIndex))}
              >
                {(usingSdk ? web.isPlaying : isPlaying) ? 'Pause' : 'Play'}
              </button>
              {!accessToken && (
                <button className="btn btn-secondary" onClick={login} title="Login with Spotify to play full tracks">
                  Login with Spotify
                </button>
              )}
            </div>
            {(usingSdk ? web.track : activeTrack) && (
              <div className="now-playing">
                <span className="np-label">Now Playing</span>
                <span className="np-title">{usingSdk ? web.track?.title : activeTrack.name}</span>
                <span className="np-artist">{usingSdk ? web.track?.artist : activeTrack.artists?.map((a: any) => a.name).join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="track-table">
          <div className="track-header">
            <div className="col index">#</div>
            <div className="col title">Title</div>
            <div className="col album">Album</div>
            <div className="col date">Release</div>
            <div className="col duration">⏱</div>
          </div>

          {topTracks.map((track: any, index: number) => (
            <div
              className={`track-row${index === currentIndex ? ' active' : ''}`}
              key={track.id}
              onClick={() => playViaMiniPlayer(index)}
            >
              <div className="col index">
                {index === currentIndex && (usingSdk ? web.isPlaying : isPlaying) ? (
                  <span className="playing-indicator" aria-label="Playing">
                    <span></span><span></span><span></span>
                  </span>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="col title">
                <div className="track-info">
                  <div className="track-cover">
                    {track.album?.images?.[0]?.url ? (
                      <img src={track.album.images[0].url} alt={`${track.album?.name} cover`} loading="lazy" />
                    ) : (
                      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                        <rect width="60" height="60" fill="#5A8DEE" />
                      </svg>
                    )}
                  </div>
                  <div className="track-text">
                    <p className="track-name">{track.name}</p>
                    <p className="track-artist">{track.artists?.map((a: any) => a.name).join(', ')}</p>
                  </div>
                </div>
              </div>
              <div className="col album">{track.album?.name}</div>
              <div className="col date">{track.album?.release_date ? new Date(track.album.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</div>
              <div className="col duration">{formatDuration(track.duration_ms)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Playlist
