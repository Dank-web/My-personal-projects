import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { songService, userService } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Auth
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('soundsphere_user')); } catch { return null; }
  });

  // Player
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('none'); // 'none' | 'one' | 'all'
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);

  // Toast
  const [toast, setToast] = useState(null);

  const audioRef = useRef(new Audio());
  const adTimerRef = useRef(null);
  const playCountedRef = useRef(false);

  // Persist user
  const login = (userData, token) => {
    localStorage.setItem('soundsphere_token', token);
    localStorage.setItem('soundsphere_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('soundsphere_token');
    localStorage.removeItem('soundsphere_user');
    setUser(null);
    audioRef.current.pause();
    setCurrentSong(null);
    setIsPlaying(false);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('soundsphere_user', JSON.stringify(updated));
  };

  const showToast = useCallback((message, type = 'default') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Play a song (with optional queue)
  const playSong = useCallback(async (song, songQueue = [], index = 0) => {
    if (!song) return;
    setCurrentSong(song);
    setQueue(songQueue.length ? songQueue : [song]);
    setQueueIndex(index);
    setProgress(0);
    playCountedRef.current = false;

    audioRef.current.src = song.fileUrl;
    audioRef.current.volume = volume;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (e) {
      console.error('Play error:', e);
    }
  }, [volume]);

  const togglePlay = useCallback(async () => {
    if (!currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying, currentSong]);

  const playNext = useCallback(() => {
    if (!queue.length) return;
    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (queueIndex + 1) % queue.length;
    }
    const nextSong = queue[nextIndex];
    setQueueIndex(nextIndex);
    playSong(nextSong, queue, nextIndex);
  }, [queue, queueIndex, shuffle, playSong]);

  const playPrev = useCallback(() => {
    if (!queue.length) return;
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    playSong(queue[prevIndex], queue, prevIndex);
  }, [queue, queueIndex, playSong]);

  const seek = useCallback((pct) => {
    const time = pct * audioRef.current.duration;
    if (!isNaN(time)) audioRef.current.currentTime = time;
  }, []);

  const setVolumeLevel = useCallback((v) => {
    setVolume(v);
    audioRef.current.volume = v;
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
        // Count play after 10s
        if (audio.currentTime > 10 && !playCountedRef.current && currentSong) {
          playCountedRef.current = true;
          songService.incrementPlay(currentSong._id).then((res) => {
            updateUser({ credits: res.data.credits });
          }).catch(() => {});
        }
      }
    };

    const onLoadedMetadata = () => setDuration(audio.duration);

    const onEnded = () => {
      setIsPlaying(false);
      // Show ad for free users
      if (user && !user.isPremium) {
        setShowAd(true);
        setAdCountdown(5);
      } else {
        handleSongEnd();
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentSong, user, queue, queueIndex, repeat, shuffle]);

  const handleSongEnd = useCallback(() => {
    if (repeat === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    } else if (repeat === 'all' || queueIndex < queue.length - 1) {
      playNext();
    }
  }, [repeat, queueIndex, queue, playNext]);

  // Ad countdown
  useEffect(() => {
    if (!showAd) return;
    adTimerRef.current = setInterval(() => {
      setAdCountdown((c) => {
        if (c <= 1) {
          clearInterval(adTimerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(adTimerRef.current);
  }, [showAd]);

  const dismissAd = () => {
    if (adCountdown > 0) return;
    setShowAd(false);
    handleSongEnd();
  };

  return (
    <AppContext.Provider value={{
      user, login, logout, updateUser,
      currentSong, queue, queueIndex, isPlaying, progress, duration, volume, shuffle, repeat,
      playSong, togglePlay, playNext, playPrev, seek, setVolumeLevel,
      setShuffle, setRepeat,
      showAd, adCountdown, dismissAd,
      toast, showToast,
      audioRef,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
