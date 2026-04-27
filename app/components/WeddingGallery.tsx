'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

// ── Configuration ────────────────────────────────────────────
// Replace with your funny YouTube video ID (the part after ?v= in the URL)
const YOUTUBE_VIDEO_ID = 'G44xTr8D_bw'

// ─────────────────────────────────────────────────────────────

const CAPTIONS = [
  'Vimukthi in his natural element ✨',
  'The face that somehow won her heart ♡',
  'We present: Exhibit A 🎪',
  'A candid moment he will definitely remember 😂',
  'This man is now someone\'s husband ✨',
  'Samadhi, it\'s not too late... just kidding ♡',
  'One of his finest moments, documented for posterity ✨',
  'He cleans up nicely, we promise ♡',
  'From your friends, with love and zero regrets ✨',
  'A true gentleman... mostly ♡',
  'Your friends will never let you live this down ✨',
  'Congratulations Samadhi — you deserve the world ♡',
  'Evidence submitted by the prosecution ✨',
  'This is why we were invited to the wedding ♡',
  'Made with love, served with chaos ✨',
  'We love you bro. We really, truly do ♡',
  'The groom, ladies and gentlemen 🎉',
  'A moment captured by his very supportive friends ✨',
  'Cheers to the happy couple — especially Samadhi ♡',
]

interface HeartConfig {
  symbol: string
  dur: number
  del: number
  left: number
  size: number
}

interface Props {
  images: string[]
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function WeddingGallery({ images }: Props) {
  const [overlayMounted, setOverlayMounted] = useState(true)
  const [entered, setEntered] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [musicPanelOpen, setMusicPanelOpen] = useState(false)
  const [volume, setVolume] = useState(70)
  const [captionKey, setCaptionKey] = useState(0) // triggers caption fade

  const ytPlayerRef = useRef<ReturnType<typeof window.YT.Player> | null>(null)
  const ytReadyRef = useRef(false)
  const pendingPlayRef = useRef(false)
  const touchStartXRef = useRef(0)
  const touchStartYRef = useRef(0)

  // Stable heart configs — generated once, never change
  const hearts = useMemo<HeartConfig[]>(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        symbol: ['♡', '♥', '✦', '✿'][i % 4],
        dur: 6 + Math.random() * 9,
        del: Math.random() * 10,
        left: Math.random() * 100,
        size: 0.6 + Math.random() * 1.1,
      })),
    [],
  )

  // ── YouTube IFrame API ────────────────────────────────────
  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => {
      try {
        ytPlayerRef.current = new window.YT.Player('yt-player', {
          videoId: YOUTUBE_VIDEO_ID,
          playerVars: {
            autoplay: 0,
            controls: 0,
            loop: 1,
            playlist: YOUTUBE_VIDEO_ID,
            modestbranding: 1,
            rel: 0,
            fs: 0,
          },
          events: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onReady: (e: any) => {
              ytReadyRef.current = true
              e.target.setVolume(volume)
              if (pendingPlayRef.current) e.target.playVideo()
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onStateChange: (e: any) => {
              setMusicPlaying(e.data === 1) // 1 = YT.PlayerState.PLAYING
            },
          },
        })
      } catch {
        // YouTube unavailable — gallery still works
      }
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).onYouTubeIframeAPIReady
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard navigation ───────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenIdx !== null) { closeFullscreen(); return }
      if (!entered) return
      if (e.key === 'ArrowLeft')  navigate('prev')
      if (e.key === 'ArrowRight') navigate('next')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }) // no dep array — always reads latest closures

  // ── Close music panel on outside click ───────────────────
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const widget = document.getElementById('music-widget')
      if (widget && !widget.contains(e.target as Node)) setMusicPanelOpen(false)
    }
    document.addEventListener('click', handleOutside)
    return () => document.removeEventListener('click', handleOutside)
  }, [])

  // ── Helpers ───────────────────────────────────────────────
  const startMusic = useCallback(() => {
    if (ytReadyRef.current && ytPlayerRef.current) {
      ytPlayerRef.current.playVideo()
    } else {
      pendingPlayRef.current = true
    }
  }, [])

  const handleEnter = useCallback(() => {
    if (entered) return
    startMusic()
    setEntered(true)
    setTimeout(() => setOverlayMounted(false), 900)
  }, [entered, startMusic])

  const navigate = useCallback(
    (dir: 'prev' | 'next') => {
      setCurrentIndex((i) => (dir === 'prev' ? (i - 1 + images.length) % images.length : (i + 1) % images.length))
      setCaptionKey((k) => k + 1)
    },
    [images.length],
  )

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(((index % images.length) + images.length) % images.length)
      setCaptionKey((k) => k + 1)
    },
    [images.length],
  )

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
    touchStartYRef.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartXRef.current
      const dy = e.changedTouches[0].clientY - touchStartYRef.current
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) navigate(dx < 0 ? 'next' : 'prev')
    },
    [navigate],
  )

  const togglePlayPause = useCallback(() => {
    if (!ytReadyRef.current || !ytPlayerRef.current) return
    if (ytPlayerRef.current.getPlayerState() === 1) ytPlayerRef.current.pauseVideo()
    else ytPlayerRef.current.playVideo()
  }, [])

  const handleVolumeChange = useCallback((val: number) => {
    setVolume(val)
    if (ytReadyRef.current && ytPlayerRef.current) ytPlayerRef.current.setVolume(val)
  }, [])

  const openFullscreen = useCallback((index: number) => {
    setFullscreenIdx(index)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeFullscreen = useCallback(() => {
    setFullscreenIdx(null)
    document.body.style.overflow = ''
  }, [])

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      {/* Hidden YouTube player container */}
      <div style={{ position: 'absolute', left: -9999, top: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        <div id="yt-player" />
      </div>

      {/* ── Entrance overlay ── */}
      {overlayMounted && (
        <div
          className="entrance-overlay"
          style={{
            opacity: entered ? 0 : 1,
            pointerEvents: entered ? 'none' : 'all',
            transition: 'opacity 0.8s ease',
          }}
        >
          <div className="heart-bg">
            {hearts.map((h, i) => (
              <span
                key={i}
                className="heart-particle"
                style={
                  {
                    '--dur': `${h.dur}s`,
                    '--del': `${h.del}s`,
                    left: `${h.left}%`,
                    fontSize: `${h.size}rem`,
                  } as React.CSSProperties
                }
              >
                {h.symbol}
              </span>
            ))}
          </div>

          <div className="overlay-content">
            <span className="overlay-ornament">— ♡ —</span>
            <h1>Congratulations!</h1>
            <span className="couple-names">Vimukthi &amp; Samadhi</span>
            <div className="overlay-divider"><span>♡</span></div>
            <p>Your friends have put together something very special for you&nbsp;🎁</p>
            <button className="enter-btn" onClick={handleEnter}>
              Open Your Gift &nbsp;♡
            </button>
          </div>
        </div>
      )}

      {/* ── Gallery page ── */}
      {entered && (
        <div className="gallery-page">
          <header className="gallery-header">
            <span className="top-ornament">— ♡ —</span>
            <h1>A Message From Your Friends</h1>
            <span className="gallery-couple">Vimukthi &amp; Samadhi</span>
            <div className="header-divider"><span>✦</span></div>
            <p>
              We couldn&apos;t be happier for you both. ♡<br />
              We made this with love — and maybe a tiny bit of mischief.
            </p>
          </header>

          <main className="carousel-section">
            <div
              className="carousel-frame"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {images.length === 0 ? (
                <div className="carousel-loading">No images found in /public/images/ ♡</div>
              ) : (
                images.map((filename, i) => (
                  <div
                    key={filename}
                    className={`carousel-slide${i === currentIndex ? ' active' : ''}`}
                    onClick={() => openFullscreen(i)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/${encodeURIComponent(filename)}`}
                      alt={`Memory ${i + 1}`}
                      loading="eager"
                    />
                  </div>
                ))
              )}
            </div>

            <button className="carousel-arrow prev" onClick={() => navigate('prev')} aria-label="Previous photo">
              &#8249;
            </button>
            <button className="carousel-arrow next" onClick={() => navigate('next')} aria-label="Next photo">
              &#8250;
            </button>

            {/* Caption — remount on index change to trigger CSS fade */}
            <p key={captionKey} className="carousel-caption" style={{ animation: 'fadeInUp 0.4s ease' }}>
              {CAPTIONS[currentIndex % CAPTIONS.length]}
            </p>

            <div className="carousel-counter">
              {currentIndex + 1} / {images.length}
            </div>

            <div className="carousel-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`dot${i === currentIndex ? ' active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to photo ${i + 1}`}
                />
              ))}
            </div>
          </main>

          <footer className="gallery-footer">
            <span className="footer-ornament">♡</span>
            <p>With love &amp; endless laughter, Your Friends</p>
            <small>Vimukthi — you&apos;re welcome 😂 &nbsp;·&nbsp; April 2026</small>
          </footer>
        </div>
      )}

      {/* ── Fullscreen modal ── */}
      <div
        className={`fullscreen-modal${fullscreenIdx !== null ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        onClick={closeFullscreen}
      >
        <button className="close-fs-btn" onClick={closeFullscreen} aria-label="Close">
          ✕
        </button>
        {fullscreenIdx !== null && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/images/${encodeURIComponent(images[fullscreenIdx])}`}
            alt="Wedding photo full size"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* ── Music widget ── */}
      {entered && (
        <div className="music-widget" id="music-widget">
          <div className={`music-panel${musicPanelOpen ? ' open' : ''}`}>
            <label>Volume</label>
            <input
              type="range"
              className="volume-slider"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
            />
            <button className="play-pause-btn" onClick={togglePlayPause}>
              {musicPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
          <button
            className={`music-btn${musicPlaying ? ' playing' : ''}`}
            aria-label="Music controls"
            onClick={(e) => {
              e.stopPropagation()
              setMusicPanelOpen((prev) => !prev)
            }}
          >
            🎵
          </button>
        </div>
      )}
    </>
  )
}
