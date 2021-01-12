import SpotifyPlayer from './SpotifyPlayer';
import AppleMusicPlayer from './AppleMusicPlayer';

let spotifyPlayer;
let appleMusicPlayer;

export async function getOrCreatePlayer(type, opts) {
  const initializeParams = {
    initialVolume: opts.initialVolume,
  };
  if (type === 'spotify') {
    if (!spotifyPlayer) {
      spotifyPlayer = new SpotifyPlayer(opts);
      await spotifyPlayer.initialize(initializeParams);
    }
    return spotifyPlayer;
  } else if (type === 'appleMusic') {
    if (!appleMusicPlayer) {
      appleMusicPlayer = new AppleMusicPlayer(opts);
      await appleMusicPlayer.initialize(initializeParams);
    }
    return appleMusicPlayer;
  } else {
    throw new Error(`unrecognized player type requested: ${type}`);
  }
}

export function getInitializedPlayer(type) {
  if (type === 'spotify') {
    return spotifyPlayer;
  } else if (type === 'appleMusic') {
    return appleMusicPlayer;
  } else {
    throw new Error(`unrecognized player type requested: ${type}`);
  }
}
