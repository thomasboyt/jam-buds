import genMusicKitToken from '@tboyt/music-kit-jwt';

/**
 * TODO: This is slightly suboptimal, I think, since we generate a new key for every user.
 */
export default ({ $config, store }) => {
  if ($config.DISABLE_APPLE_MUSIC) {
    return;
  }

  const token = genMusicKitToken({
    pathToPrivateKey: $config.MUSICKIT_PRIVATE_KEY_PATH,
    teamId: $config.MUSICKIT_TEAM_ID,
    keyId: $config.MUSICKIT_KEY_ID,
  });

  store.commit('streaming/setMusicKitToken', token);
};
