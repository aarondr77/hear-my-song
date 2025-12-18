import { useState, useEffect, useRef } from 'react'
import './App.css'
import { getAuthUrl, getAccessTokenFromUrl, fetchPlaylist } from './spotify'

function App() {
  const [accessToken, setAccessToken] = useState(null)
  const [playlist, setPlaylist] = useState(null)
  const [error, setError] = useState(null)
  const [player, setPlayer] = useState(null)
  const [deviceId, setDeviceId] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const isExchangingToken = useRef(false)
  
  // Notes & Voice Memos State
  const [expandedTrack, setExpandedTrack] = useState(null)
  const [trackNotes, setTrackNotes] = useState({})
  const [newMessage, setNewMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('current_user') || null)
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)

  // Load saved notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('track_notes')
    if (savedNotes) {
      setTrackNotes(JSON.parse(savedNotes))
    }
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(trackNotes).length > 0) {
      localStorage.setItem('track_notes', JSON.stringify(trackNotes))
    }
  }, [trackNotes])

  // Auth initialization
  useEffect(() => {
    const initAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      
      if (urlParams.get('error')) {
        setError('Spotify authentication failed')
        window.history.replaceState({}, '', '/')
        return
      }
      
      if (code) {
        if (isExchangingToken.current) return
        isExchangingToken.current = true
        window.history.replaceState({}, '', '/')
        
        try {
          const token = await getAccessTokenFromUrl(code)
          if (token) {
            setAccessToken(token)
            localStorage.setItem('spotify_access_token', token)
          }
        } catch (err) {
          setError(err.message)
          localStorage.removeItem('spotify_access_token')
        }
      } else {
        const savedToken = localStorage.getItem('spotify_access_token')
        if (savedToken) setAccessToken(savedToken)
      }
    }
    initAuth()
  }, [])

  // Fetch playlist when authenticated
  useEffect(() => {
    if (!accessToken) return
    
    fetchPlaylist(accessToken)
      .then(setPlaylist)
      .catch(err => {
        setError(err.message)
        if (err.message.includes('401')) {
          localStorage.removeItem('spotify_access_token')
          setAccessToken(null)
        }
      })
  }, [accessToken])

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!accessToken) return

    const initPlayer = () => {
      const newPlayer = new window.Spotify.Player({
        name: 'Our Shared Songs',
        getOAuthToken: cb => cb(accessToken),
        volume: 0.5
      })

      newPlayer.addListener('ready', ({ device_id }) => setDeviceId(device_id))
      newPlayer.addListener('not_ready', () => setDeviceId(null))
      
      newPlayer.addListener('player_state_changed', state => {
        if (!state) {
          setIsPlaying(false)
          return
        }
        setIsPlaying(!state.paused)
        if (state.track_window?.current_track) {
          setCurrentTrack(state.track_window.current_track)
        }
      })

      newPlayer.addListener('authentication_error', () => setError('Spotify authentication failed'))
      newPlayer.addListener('account_error', () => setError('Spotify Premium required for playback'))

      newPlayer.connect()
      setPlayer(newPlayer)
    }

    if (window.Spotify) {
      initPlayer()
    } else {
      const script = document.createElement('script')
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      script.async = true
      document.body.appendChild(script)
      window.onSpotifyWebPlaybackSDKReady = initPlayer
    }

    return () => player?.disconnect()
  }, [accessToken])

  const handleLogin = async () => {
    const authUrl = await getAuthUrl()
    window.location.href = authUrl
  }

  const handlePlay = async (trackUri) => {
    if (!deviceId || !player) return

    try {
      await player.activateElement()
      
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ device_ids: [deviceId], play: true })
      })

      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: [trackUri], position_ms: 0 })
      })

      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to play track')
      }

      setTimeout(async () => {
        const state = await player.getCurrentState()
        if (state?.paused) await player.resume()
      }, 500)

    } catch (err) {
      setError(`Playback error: ${err.message}`)
    }
  }

  // Voice Recording Functions
  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav',
      ''  // Empty string = browser default
    ]
    for (const type of types) {
      if (type === '' || MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return ''
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getSupportedMimeType()
      const options = mimeType ? { mimeType } : {}
      
      mediaRecorderRef.current = new MediaRecorder(stream, options)
      audioChunksRef.current = []
      
      // Store the actual MIME type being used
      const actualMimeType = mediaRecorderRef.current.mimeType || 'audio/webm'

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType })
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64Audio = reader.result
          addVoiceNote(expandedTrack, base64Audio)
        }
        reader.readAsDataURL(audioBlob)
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      setError('Could not access microphone. Please allow microphone access.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(recordingIntervalRef.current)
    }
  }

  const addTextNote = (trackId) => {
    if (!newMessage.trim() || !currentUser) return
    
    const note = {
      id: Date.now(),
      type: 'text',
      content: newMessage.trim(),
      author: currentUser,
      timestamp: new Date().toISOString()
    }

    setTrackNotes(prev => ({
      ...prev,
      [trackId]: [...(prev[trackId] || []), note]
    }))
    setNewMessage('')
  }

  const addVoiceNote = (trackId, audioData) => {
    if (!currentUser) return
    
    const note = {
      id: Date.now(),
      type: 'voice',
      content: audioData,
      duration: recordingTime,
      author: currentUser,
      timestamp: new Date().toISOString()
    }

    setTrackNotes(prev => ({
      ...prev,
      [trackId]: [...(prev[trackId] || []), note]
    }))
    setRecordingTime(0)
  }

  const deleteNote = (trackId, noteId) => {
    setTrackNotes(prev => ({
      ...prev,
      [trackId]: (prev[trackId] || []).filter(note => note.id !== noteId)
    }))
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  // User Selection Screen
  if (!currentUser) {
    return (
      <div className="app">
        <div className="stars"></div>
        <header>
          <h1>Our Shared Songs 💕</h1>
          <p>Who's listening today?</p>
        </header>
        <main>
          <div className="user-select">
            <button className="user-btn" onClick={() => { setCurrentUser('Partner 1'); localStorage.setItem('current_user', 'Partner 1'); }}>
              <span className="user-emoji">💜</span>
              <span>Partner 1</span>
            </button>
            <span className="heart-divider">♥</span>
            <button className="user-btn" onClick={() => { setCurrentUser('Partner 2'); localStorage.setItem('current_user', 'Partner 2'); }}>
              <span className="user-emoji">💙</span>
              <span>Partner 2</span>
            </button>
          </div>
          <p className="switch-hint">You can switch anytime from the header</p>
        </main>
      </div>
    )
  }

  // Login screen
  if (!accessToken) {
    return (
      <div className="app">
        <div className="stars"></div>
        <header>
          <h1>Our Shared Songs 💕</h1>
          <p>A place for us to share and talk about our favorite music</p>
          <div className="current-user-badge" onClick={() => { setCurrentUser(null); localStorage.removeItem('current_user'); }}>
            <span>{currentUser === 'Partner 1' ? '💜' : '💙'} {currentUser}</span>
          </div>
        </header>
        <main>
          <div className="placeholder">
            {error && <p style={{ color: '#ff4444', marginBottom: '20px' }}>{error}</p>}
            <button onClick={handleLogin}>Connect to Spotify</button>
          </div>
        </main>
      </div>
    )
  }

  // Loading screen
  if (!playlist) {
    return (
      <div className="app">
        <div className="stars"></div>
        <header>
          <h1>Our Shared Songs 💕</h1>
        </header>
        <main>
          <div className="placeholder">
            {error ? (
              <>
                <p style={{ color: '#ff4444', marginBottom: '20px' }}>{error}</p>
                <button onClick={() => { setError(null); setAccessToken(null); localStorage.removeItem('spotify_access_token') }}>
                  Try Again
                </button>
              </>
            ) : (
              <div className="loading">
                <div className="loading-heart">💕</div>
                <p>Loading your playlist...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Main playlist view
  const isTrackPlaying = (trackUri) => currentTrack?.uri === trackUri && isPlaying

  return (
    <div className="app">
      <div className="stars"></div>
      <header>
        <h1>Our Shared Songs 💕</h1>
        <p>{playlist.name} • {playlist.tracks.items.length} tracks</p>
        <div className="current-user-badge" onClick={() => { setCurrentUser(null); localStorage.removeItem('current_user'); }}>
          <span>{currentUser === 'Partner 1' ? '💜' : '💙'} {currentUser}</span>
        </div>
        {!deviceId && <p style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>⏳ Player initializing...</p>}
      </header>

      <main>
        <div className="playlist">
          {playlist.tracks.items.map((item, index) => {
            const trackId = item.track.id
            const notes = trackNotes[trackId] || []
            const isExpanded = expandedTrack === trackId
            const noteCount = notes.length

            return (
              <div key={index} className={`track-card ${isExpanded ? 'expanded' : ''} ${isTrackPlaying(item.track.uri) ? 'playing' : ''}`}>
                <div className="track-main" onClick={() => setExpandedTrack(isExpanded ? null : trackId)}>
                  <img
                    src={item.track.album.images[0]?.url}
                    alt={item.track.name}
                    className="album-art"
                  />
                  <div className="track-info">
                    <h3>{item.track.name}</h3>
                    <p>{item.track.artists.map(a => a.name).join(', ')}</p>
                    {isTrackPlaying(item.track.uri) && (
                      <span className="now-playing-badge">♫ Now Playing</span>
                    )}
                    {noteCount > 0 && (
                      <span className="note-count">{noteCount} {noteCount === 1 ? 'note' : 'notes'} 💬</span>
                    )}
                  </div>
                  <button
                    className="play-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      isTrackPlaying(item.track.uri) ? player.togglePlay() : handlePlay(item.track.uri)
                    }}
                    disabled={!deviceId}
                    style={{ opacity: deviceId ? 1 : 0.5 }}
                  >
                    {isTrackPlaying(item.track.uri) ? '⏸' : '▶'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="notes-section">
                    <div className="notes-list">
                      {notes.length === 0 ? (
                        <p className="no-notes">No notes yet! Be the first to share your thoughts 💭</p>
                      ) : (
                        notes.map(note => (
                          <div key={note.id} className={`note ${note.author === 'Partner 1' ? 'partner1' : 'partner2'}`}>
                            <div className="note-header">
                              <span className="note-author">
                                {note.author === 'Partner 1' ? '💜' : '💙'} {note.author}
                              </span>
                              <span className="note-time">{formatDate(note.timestamp)}</span>
                              {note.author === currentUser && (
                                <button className="delete-note" onClick={() => deleteNote(trackId, note.id)}>×</button>
                              )}
                            </div>
                            {note.type === 'text' ? (
                              <p className="note-content">{note.content}</p>
                            ) : (
                              <div className="voice-note">
                                <audio controls src={note.content} />
                                <span className="voice-duration">{formatTime(note.duration)}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="add-note">
                      <div className="text-input-row">
                        <input
                          type="text"
                          placeholder={`What do you think, ${currentUser}?`}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addTextNote(trackId)}
                        />
                        <button 
                          className="send-btn" 
                          onClick={() => addTextNote(trackId)}
                          disabled={!newMessage.trim()}
                        >
                          💌
                        </button>
                      </div>
                      
                      <div className="voice-input-row">
                        {isRecording ? (
                          <>
                            <div className="recording-indicator">
                              <span className="recording-dot"></span>
                              Recording... {formatTime(recordingTime)}
                            </div>
                            <button className="stop-record-btn" onClick={stopRecording}>
                              ⏹ Stop
                            </button>
                          </>
                        ) : (
                          <button className="record-btn" onClick={startRecording}>
                            🎤 Record Voice Note
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default App
