import genMusicKitToken from '@tboyt/music-kit-jwt';

export default function() {
  if (!process.env.DISABLE_APPLE_MUSIC) {
    const musicKitAuthToken = genMusicKitToken.default({
      pathToPrivateKey: process.env.MUSICKIT_PRIVATE_KEY_PATH,
      teamId: process.env.MUSICKIT_TEAM_ID,
      keyId: process.env.MUSICKIT_KEY_ID,
    });

    this.options.env.MUSICKIT_AUTH_TOKEN = musicKitAuthToken;
  }
}
