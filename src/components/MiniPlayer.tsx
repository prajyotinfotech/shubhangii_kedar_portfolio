import { useEffect } from 'react'
import { useMiniPlayer } from '../hooks/useMiniPlayer'
import { useWebPlayback } from '../contexts/SpotifyWebPlaybackContext'

const IconPlay = () => (
  <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M7 5.2v9.6L16 10 7 5.2z" fill="currentColor" />
  </svg>
)

const IconPause = () => (
  <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M7 4h2.8v12H7zM11.6 4h2.8v12h-2.8z" fill="currentColor" />
  </svg>
)

const IconNext = () => (
  <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M5 4.8v10.4L13.4 10 5 4.8zm10 0H13.6v10.4H15z" fill="currentColor" />
  </svg>
)

const IconPrev = () => (
  <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M15 4.8v10.4L6.6 10 15 4.8zM5 4.8h1.4v10.4H5z" fill="currentColor" />
  </svg>
)

const IconClose = () => (
  <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

export const MiniPlayer = () => {
  const web = useWebPlayback()
  const usingSdk = web?.playerReady && !!web.track
  const {
    audioRef,
    progressRef,
    track,
    isPlaying,
    collapsed,
    setCollapsed,
    time,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    formatTime,
  } = useMiniPlayer()

  // Auto-expand when SDK starts playing
  useEffect(() => {
    if (usingSdk && web.isPlaying && collapsed) setCollapsed(false)
  }, [usingSdk, web.isPlaying, collapsed, setCollapsed])

  // Also respond to global miniPlayerState events (from SDK context) to expand when playback starts
  useEffect(() => {
    const onState = (e: Event) => {
      const detail = (e as CustomEvent).detail as { isPlaying?: boolean }
      if (detail?.isPlaying) setCollapsed(false)
    }
    window.addEventListener('miniPlayerState' as any, onState)
    return () => window.removeEventListener('miniPlayerState' as any, onState)
  }, [])

  // Choose data source: Spotify SDK when available, otherwise local mini player
  const uiTrack = usingSdk
    ? (web.track ? { title: web.track?.title || '', artist: web.track?.artist || '', color: undefined, coverSrc: web.track?.cover } : null)
    : track
  // Do NOT return early. We always render the mini-player so the collapsed expand button is visible.
  // We will simply hide the meta/progress/controls until a real track is available.

  const current = usingSdk ? web.position / 1000 : time.current
  const duration = usingSdk ? web.duration / 1000 : time.duration
  const progressPercent = duration ? Math.min((current / duration) * 100, 100) : 0

  return (
    <div className={`mini-player${collapsed ? ' collapsed' : ''}`} id="miniPlayer">
      {uiTrack && (
      <div className="mini-track-meta">
        <div
          className="mini-cover"
          style={{
            background: (uiTrack as any).color,
            backgroundImage: (uiTrack as any).coverSrc ? `url(${(uiTrack as any).coverSrc})` : undefined,
            backgroundSize: (uiTrack as any).coverSrc ? 'cover' : undefined,
            backgroundPosition: (uiTrack as any).coverSrc ? 'center' : undefined,
          }}
        />
        <div className="mini-text">
          <div className="mini-title">{(uiTrack as any).title}</div>
          <div className="mini-artist">{(uiTrack as any).artist}</div>
        </div>
      </div>
      )}

      {uiTrack && (
      <div className="mini-progress">
        <span className="progress-time current">{formatTime(current)}</span>
        <div
          className="progress-bar"
          ref={progressRef}
          onClick={(e) => {
            if (usingSdk) {
              const el = progressRef.current
              if (!el) return
              const rect = el.getBoundingClientRect()
              const ratio = (e.clientX - rect.left) / rect.width
              web.seekTo(ratio * (web.duration || 0))
            } else {
              seek(e)
            }
          }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration) || 0}
          aria-valuenow={Math.round(current) || 0}
        >
          <span className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="progress-time duration">{formatTime(duration)}</span>
      </div>
      )}

      {uiTrack && (
      <div className="mini-controls">
        <button className="mini-btn prev" onClick={() => (usingSdk ? web.previous() : prevTrack())} aria-label="Previous track">
          <IconPrev />
        </button>
        <button className="mini-btn play" onClick={() => (usingSdk ? web.togglePlay() : togglePlay())} aria-label={(usingSdk ? web.isPlaying : isPlaying) ? 'Pause track' : 'Play track'}>
          {(usingSdk ? web.isPlaying : isPlaying) ? <IconPause /> : <IconPlay />}
        </button>
        <button className="mini-btn next" onClick={() => (usingSdk ? web.next() : nextTrack())} aria-label="Next track">
          <IconNext />
        </button>
      </div>
      )}

      <button className="mini-btn mini-close" onClick={() => setCollapsed(true)} aria-label="Collapse player">
        <IconClose />
      </button>

      <button className="mini-btn mini-expand" onClick={() => setCollapsed(false)} aria-label="Expand player">
        <IconPlay />
      </button>

      {/* Hide local audio element when using Spotify SDK */}
      {!usingSdk && <audio ref={audioRef} preload="none" />}
    </div>
  )
}

export default MiniPlayer
