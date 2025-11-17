import type { MouseEvent as ReactMouseEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { playlistTracks } from '../data/content'
import { useSpotify } from '../contexts/SpotifyContext'

const formatTime = (value: number) => {
  if (!isFinite(value)) return '0:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, '0')
  return `${minutes}:${seconds}`
}

export const useMiniPlayer = () => {
  const { topTracks } = useSpotify()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [collapsed, setCollapsed] = useState(true) // Start collapsed by default
  const [externalTrack, setExternalTrack] = useState<
    | null
    | {
        title: string
        artist: string
        color?: string
        coverSrc?: string
        src: string
      }
  >(null)
  
  // Debug effect for collapsed state
  useEffect(() => {
    console.log('MiniPlayer collapsed state changed to:', collapsed);
  }, [collapsed]);
  const [time, setTime] = useState({ current: 0, duration: 0 })
  // Prefer Spotify top tracks that have a preview_url; otherwise fall back to local demo tracks
  const spotifyPreviewTracks = useMemo(() => {
    if (!topTracks || topTracks.length === 0) return [] as { title: string; artist: string; coverSrc?: string; color?: string; src: string }[]
    return topTracks
      .filter((t: any) => !!t.preview_url)
      .map((t: any) => ({
        title: t.name as string,
        artist: (t.artists || []).map((a: any) => a.name).join(', '),
        coverSrc: t.album?.images?.[0]?.url as string | undefined,
        color: undefined,
        src: t.preview_url as string,
      }))
  }, [topTracks])

  const tracks = spotifyPreviewTracks.length > 0 ? spotifyPreviewTracks : playlistTracks
  const track = useMemo(() => (externalTrack ? externalTrack : tracks[trackIndex]), [externalTrack, trackIndex, tracks])

  const loadTrack = (index: number) => {
    const audio = audioRef.current
    if (!audio) return
    if (externalTrack) {
      audio.src = externalTrack.src
    } else {
      audio.src = tracks[index].src
    }
    audio.currentTime = 0
  }

  useEffect(() => {
    loadTrack(trackIndex)
  }, [trackIndex, externalTrack])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying, trackIndex, externalTrack])

  // Broadcast play state for global UI (e.g., rotating disc)
  useEffect(() => {
    const root = document.documentElement
    if (isPlaying) root.classList.add('is-playing')
    else root.classList.remove('is-playing')
    root.dataset.currentTrack = String(trackIndex)
    const detail = { isPlaying, trackIndex, track }
    const evt = new CustomEvent('miniPlayerState', { detail })
    window.dispatchEvent(evt)
  }, [isPlaying, trackIndex, track])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () =>
      setTime({ current: audio.currentTime, duration: audio.duration || 0 })

    const onEnded = () => setTrackIndex((prev) => (prev + 1) % tracks.length)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }, [tracks.length])

  // Listen for external play/pause requests
  useEffect(() => {
    const onPlayTrack = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | {
            trackIndex?: number
            track?: { title: string; artist: string; color?: string; coverSrc?: string; previewUrl?: string }
          }
        | undefined
      if (!detail) return
      if (detail.track?.previewUrl) {
        setExternalTrack({
          title: detail.track.title,
          artist: detail.track.artist,
          color: detail.track.color,
          coverSrc: detail.track.coverSrc,
          src: detail.track.previewUrl,
        })
        setIsPlaying(true)
        setCollapsed(false)
      } else if (typeof detail.trackIndex === 'number') {
        setExternalTrack(null)
        setTrackIndex(Math.max(0, Math.min(tracks.length - 1, detail.trackIndex)))
        setIsPlaying(true)
        setCollapsed(false)
      }
    }
    const onToggle = () => {
      const newIsPlaying = !isPlaying
      setIsPlaying(newIsPlaying)
      if (newIsPlaying) setCollapsed(false)
    }
    window.addEventListener('playTrack' as any, onPlayTrack)
    window.addEventListener('togglePlayPause' as any, onToggle)
    return () => {
      window.removeEventListener('playTrack' as any, onPlayTrack)
      window.removeEventListener('togglePlayPause' as any, onToggle)
    }
  }, [isPlaying, tracks.length])

  const playTrack = (index: number) => {
    setExternalTrack(null)
    setTrackIndex(index)
    setIsPlaying(true)
    setCollapsed(false) // Expand when a specific track is played
  };

  const togglePlay = () => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    
    // Expand the player when starting to play
    if (newIsPlaying) {
      setCollapsed(false);
    }
  };

  const nextTrack = () => {
    playTrack((trackIndex + 1) % tracks.length);
  };

  const prevTrack = () => {
    playTrack((trackIndex - 1 + tracks.length) % tracks.length);
  }

  const seek = (event: ReactMouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const bar = progressRef.current
    if (!audio || !bar) return

    const rect = bar.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    audio.currentTime = ratio * audio.duration
  }

  return {
    audioRef,
    progressRef,
    track,
    tracks,
    trackIndex,
    setTrackIndex,
    isPlaying,
    setIsPlaying,
    collapsed,
    setCollapsed,
    time,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    formatTime,
  }
}

export default useMiniPlayer
