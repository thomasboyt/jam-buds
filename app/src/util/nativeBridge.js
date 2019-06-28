export function getNativeApp() {
  if (typeof window === 'undefined') {
    // server-side rendering
    return null;
  }

  if (window.isIos) {
    return 'ios';
  } else if (window.SpotifyHandler) {
    return 'android';
  } else {
    return null;
  }
}

export function registerNativeListeners(store) {
  window.addEventListener('spotifyConnected', () => {
    store.commit('connectedSpotify');
  });

  window.addEventListener('spotifyDisconnected', () => {
    store.commit('disconnectedSpotify');
  });

  if (getNativeApp() === 'android') {
    window.SpotifyHandler.ready();
  }
}
