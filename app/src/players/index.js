import SpotifyPlayer from './SpotifyPlayer';
import AppleMusicPlayer from './AppleMusicPlayer';

let spotifyPlayer;
let appleMusicPlayer;

export async function getOrCreatePlayer(type, opts) {
  if (type === 'spotify') {
    if (!spotifyPlayer) {
      spotifyPlayer = new SpotifyPlayer(opts);
      await spotifyPlayer.initialize();
    }

    return spotifyPlayer;
  } else if (type === 'applemusic') {
    if (!appleMusicPlayer) {
      appleMusicPlayer = new AppleMusicPlayer(opts);
      await appleMusicPlayer.initialize();
    }

    return appleMusicPlayer;
  } else {
    throw new Error(`unrecognized player type requested: ${type}`);
  }
}
