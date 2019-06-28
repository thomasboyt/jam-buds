<template>
  <div>
    <panel title="connect to streaming services">
      <native-streaming-section v-if="nativeApp" />
      <connect-streaming-section v-else />
    </panel>

    <panel title="connect to twitter">
      <connect-twitter-section />
    </panel>
  </div>
</template>

<script>
import ConnectStreamingSection from '../../components/settings/ConnectStreamingSection.vue';
import NativeStreamingSection from '../../components/settings/native/NativeStreamingSection.vue';
import ConnectTwitterSection from '../../components/settings/ConnectTwitterSection.vue';
import Panel from '../../components/Panel.vue';
import { getNativeApp } from '../../util/nativeBridge';

export default {
  components: {
    Panel,
    ConnectStreamingSection,
    NativeStreamingSection,
    ConnectTwitterSection,
  },

  data() {
    return {
      nativeApp: getNativeApp(),
    };
  },
};
</script>
