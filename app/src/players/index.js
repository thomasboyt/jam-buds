import SpotifyPlayer from './SpotifyPlayer';
import SpotifyAndroidPlayer from './SpotifyAndroidPlayer';
import AppleMusicPlayer from './AppleMusicPlayer';
import { getNativeApp } from '../util/nativeBridge';

let spotifyPlayer;
let appleMusicPlayer;

export async function getOrCreatePlayer(type, opts) {
  if (type === 'spotify') {
    if (!spotifyPlayer) {
      if (getNativeApp() === 'android') {
        spotifyPlayer = new SpotifyAndroidPlayer(opts);
      } else {
        spotifyPlayer = new SpotifyPlayer(opts);
      }
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
