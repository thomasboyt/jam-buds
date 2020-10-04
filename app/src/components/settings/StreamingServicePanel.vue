<template>
  <settings-panel-expanding :title="title" path="/settings/streaming-service">
    {{ description }}
    <template #expanded>
      <streaming-service-connect />
    </template>
  </settings-panel-expanding>
</template>

<script>
import { mapState } from 'vuex';
import SettingsPanelExpanding from './SettingsPanelExpanding.vue';
import StreamingServiceConnect from './StreamingServiceConnect.vue';

export default {
  components: { SettingsPanelExpanding, StreamingServiceConnect },

  computed: {
    ...mapState({
      hasSpotify: (state) => state.streaming.hasSpotify,
      hasAppleMusic: (state) => state.streaming.hasAppleMusic,
    }),

    title() {
      if (this.hasSpotify) {
        return 'Connected to Spotify';
      } else if (this.hasAppleMusic) {
        return 'Connected to Apple Music';
      } else {
        return 'Connect a streaming service';
      }
    },

    description() {
      if (this.hasSpotify || this.hasAppleMusic) {
        const serviceName = this.hasSpotify ? 'Spotify' : 'Apple Music';
        return `you'll listen to music using ${serviceName} on this device.`;
      } else {
        return 'connect to Spotify or Apple Music to use the Jam Buds music player';
      }
    },
  },
};
</script>