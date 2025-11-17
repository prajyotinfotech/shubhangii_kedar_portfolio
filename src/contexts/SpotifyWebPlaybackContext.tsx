import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'

interface WebPlaybackContextType {
  deviceId: string | null
  playerReady: boolean
  track: null | { title: string; artist: string; cover?: string; uri?: string }
  isPlaying: boolean
  position: number
  duration: number
  togglePlay: () => Promise<void>
  next: () => Promise<void>
  previous: () => Promise<void>
  seekTo: (ms: number) => Promise<void>
}

const WPCTX = createContext<WebPlaybackContextType>({
  deviceId: null,
  playerReady: false,
  track: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  togglePlay: async () => {},
  next: async () => {},
  previous: async () => {},
  seekTo: async () => {},
})

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void
    Spotify?: any
  }
}

const loadSdk = () =>
  new Promise<void>((resolve) => {
    if (window.Spotify) return resolve()
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)
    window.onSpotifyWebPlaybackSDKReady = () => resolve()
  })

export const useWebPlayback = () => useContext(WPCTX)

export const SpotifyWebPlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accessToken } = useAuth()
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [track, setTrack] = useState<WebPlaybackContextType['track']>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    let player: any
    let cancelled = false
    if (!accessToken) return

    ;(async () => {
      await loadSdk()
      if (cancelled) return
      player = new window.Spotify.Player({
        name: 'Portfolio Player',
        getOAuthToken: (cb: (t: string) => void) => cb(accessToken),
        volume: 0.8,
      })

      player.addListener('ready', ({ device_id }: any) => {
        setDeviceId(device_id)
        setPlayerReady(true)
        console.log('Spotify Web Playback ready on device', device_id)
      })
      player.addListener('not_ready', ({ device_id }: any) => {
        console.log('Device ID has gone offline', device_id)
        setPlayerReady(false)
      })
      player.addListener('initialization_error', ({ message }: any) => console.error(message))
      player.addListener('authentication_error', ({ message }: any) => console.error(message))
      player.addListener('account_error', ({ message }: any) => console.error(message))

      player.addListener('player_state_changed', (state: any) => {
        if (!state) return
        const current = state.track_window?.current_track
        const artists = current?.artists?.map((a: any) => a.name).join(', ')
        setTrack(
          current
            ? {
                title: current.name,
                artist: artists || '',
                cover: current.album?.images?.[0]?.url,
                uri: current.uri,
              }
            : null,
        )
        setIsPlaying(!state.paused)
        setPosition(state.position || 0)
        setDuration(state.duration || 0)

        // Broadcast for components that listen to miniPlayerState (e.g., rotating disc)
        const evt = new CustomEvent('miniPlayerState', {
          detail: {
            isPlaying: !state.paused,
            trackIndex: 0,
            track: current
              ? { title: current.name, artist: artists || '', coverSrc: current.album?.images?.[0]?.url }
              : null,
          },
        })
        window.dispatchEvent(evt)
      })

      await player.connect()
    })()

    return () => {
      cancelled = true
      try {
        player?.disconnect()
      } catch {}
    }
  }, [accessToken])

  const api = async (path: string, method: string, body?: any) => {
    if (!accessToken) return
    await fetch(`https://api.spotify.com/v1/${path}`, {
      method,
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  const togglePlay = async () => {
    try {
      await api('me/player/' + (isPlaying ? 'pause' : 'play'), 'PUT')
    } catch (e) {
      console.error('togglePlay failed', e)
    }
  }
  const next = async () => {
    try {
      await api('me/player/next', 'POST')
    } catch (e) {
      console.error('next failed', e)
    }
  }
  const previous = async () => {
    try {
      await api('me/player/previous', 'POST')
    } catch (e) {
      console.error('previous failed', e)
    }
  }
  const seekTo = async (ms: number) => {
    try {
      await api(`me/player/seek?position_ms=${Math.max(0, Math.floor(ms))}`, 'PUT')
    } catch (e) {
      console.error('seek failed', e)
    }
  }

  const value = useMemo(
    () => ({ deviceId, playerReady, track, isPlaying, position, duration, togglePlay, next, previous, seekTo }),
    [deviceId, playerReady, track, isPlaying, position, duration]
  )
  return <WPCTX.Provider value={value}>{children}</WPCTX.Provider>
}
