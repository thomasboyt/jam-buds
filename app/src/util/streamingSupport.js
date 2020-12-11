// notes:
// - could split up by browser on desktop/android
// - some day could make toggleable without deploy

const streamingSupport = {
  spotify: {
    desktopWeb: true,
    // desktop & iOS Safari: does not support Widevine or PlayReady EME DRM
    unknownSafariWeb: false,
    iosWeb: false,
    // Android (Chrome): strange bug with tracks being designated as immediately played
    androidWeb: false,
    // Spotify iOS SDK: unusable tire fire
    iosNative: false,
    // Spotify Android SDK: also an unusable tire fire
    androidNative: false,
  },
  appleMusic: {
    desktopWeb: true,
    // iOS (Safari): no background track segues, otherwise fine
    unknownSafariWeb: true,
    iosWeb: true,
    // Android (Chrome): disabled due to weird crackling issues
    androidWeb: false,
    // TODO (MusicKit)
    iosNative: false,
    // TODO (MusicKit)
    androidNative: false,
  },
};

function getPlatformKey(ua, isWebView) {
  if (ua.match(/iPhone|iPad|iPod/i)) {
    return isWebView ? 'iosNative' : 'iosWeb';
  } else if (ua.match(/Android/)) {
    return isWebView ? 'androidNative' : 'androidWeb';
  } else if (ua.match(/Safari/)) {
    // "unknown" here because iPad sometimes pretends to be MacOS.
    // thankfully, we just want to disable spotify entirely across Safari
    return 'unknownSafariWeb';
  } else {
    return 'desktopWeb';
  }
}

export function getStreamingSupport(service, ua, isWebView) {
  const key = getPlatformKey(ua, isWebView);
  return streamingSupport[service][key];
}