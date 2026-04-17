import { useApp } from '../context/AppContext';

/**
 * Convenience hook that exposes only player-related state and actions.
 * Use this in components that don't need auth/toast context.
 */
export function usePlayer() {
  const {
    currentSong,
    queue,
    queueIndex,
    isPlaying,
    progress,
    duration,
    volume,
    shuffle,
    repeat,
    playSong,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolumeLevel,
    setShuffle,
    setRepeat,
  } = useApp();

  return {
    currentSong,
    queue,
    queueIndex,
    isPlaying,
    progress,
    duration,
    volume,
    shuffle,
    repeat,
    playSong,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolumeLevel,
    setShuffle,
    setRepeat,
    isCurrentSong: (id) => currentSong?._id === id,
  };
}
