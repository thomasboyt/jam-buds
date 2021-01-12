<template>
  <!-- TODO: loading spinner or something here ? -->
  <div />
</template>

<script>
import {
  getAndClearSpotifyOauthState,
  getAndClearSpotifyOauthRedirect,
} from '~/util/localStorage';

export default {
  async mounted() {
    const state = this.$route.query.state;
    const code = this.$route.query.code;
    const error = this.$route.query.error;

    const savedState = getAndClearSpotifyOauthState();
    const redirect = getAndClearSpotifyOauthRedirect() || '/';

    const doRedirect = () => this.$router.replace(redirect);

    if (state !== savedState) {
      this.showError('Invalid Oauth state');
      return doRedirect();
    }

    if (!redirect) {
      this.showError('Invalid Oauth token');
      return doRedirect();
    }

    if (error) {
      this.showError('Oauth error');
      return doRedirect();
    }

    let resp;
    try {
      resp = await this.redeemCode(code);
    } catch (err) {
      this.showError('Error redeeming code');
      return doRedirect();
    }
    localStorage.setItem('spotifyRefreshToken', resp.refreshToken);
    localStorage.setItem('spotifyAccessToken', resp.accessToken);
    localStorage.setItem('spotifyExpiresIn', resp.expiresIn);
    this.$store.dispatch('updateStreamingService', 'spotify');
  },

  async redeemCode(code) {
    const resp = await this.$axios({
      method: 'post',
      url: '/api/spotify-token/swap',
      data: { code },
    });
    return resp.data;
  },

  showError(error) {
    // remove error from path to prevent re-triggering
    this.$router.replace(this.$route.path);

    if (error === 'nonPremium') {
      this.$store.commit(
        'showErrorModal',
        "Error connecting Spotify: You must have a premium (paid) Spotify account to stream to it from Jam Buds.\n\nSorry, I don't make the rules :("
      );
    } else {
      this.$store.commit(
        'showErrorModal',
        `Error connecting Spotify: ${error || '(unknown)'}`
      );
    }
  },
};
</script>