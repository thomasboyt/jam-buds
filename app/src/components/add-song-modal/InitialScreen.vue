<template>
  <div>
    <p>
      Paste a <strong>Youtube, Bandcamp, or Soundcloud</strong> song URL to share in the box
      below to get started!
    </p>

    <form class="submit-box" @submit="handleSubmit">
      <div class="input-container">
        <input type="text" v-model="songUrl" @input="handleInput" placeholder="Paste a link here!!" :class="{invalid}">
      </div>

      <button type="submit" :disabled="buttonDisabled" :class="['submit-song', {invalid}]">
        <span>is my shit</span>
      </button>
    </form>
  </div>
</template>

<script>
import {getPlaybackSourceForUrl} from '../../playbackSources';

export default {
  data() {
    return {
      songUrl: '',
      invalid: false,
      requestInFlight: false,
    };
  },

  computed: {
    buttonDisabled() {
      return this.songUrl === '' || this.invalid || this.requestInFlight;
    },
  },

  methods: {
    handleInput() {
      this.invalid = false;
    },

    async handleSubmit(evt) {
      evt.preventDefault();

      if (!getPlaybackSourceForUrl(this.songUrl)) {
        this.invalid = true;
        return;
      }

      this.requestInFlight = true;

      try {
        await this.$store.dispatch('submitSongLink', this.songUrl);
      } catch(err) {
        console.error('error submitting song');
        console.error(err);
        this.requestInFlight = false;
      }
    }
  }
}
</script>