<template>
  <settings-panel-expanding :title="title" path="/settings/streaming-service">
    {{ description }}
    <template #expanded>
      <streaming-service-connect />
    </template>
  </settings-panel-expanding>
</template>

<script>
import SettingsPanelExpanding from './SettingsPanelExpanding.vue';
import StreamingServiceConnect from './StreamingServiceConnect.vue';

export default {
  components: { SettingsPanelExpanding, StreamingServiceConnect },

  computed: {
    serviceName() {
      return this.$store.getters['streaming/streamingServiceName'];
    },

    title() {
      if (this.serviceName) {
        return `Listening with ${this.serviceName}`;
      } else {
        return 'Select a streaming service';
      }
    },

    description() {
      if (this.serviceName) {
        return `you'll listen to music using ${this.serviceName} on this device.`;
      } else {
        return 'select a streaming service to listen to music with';
      }
    },
  },
};
</script>
