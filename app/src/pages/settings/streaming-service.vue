<template>
  <main-wrapper>
    <page-header title="streaming settings" />

    <p v-if="hasSpotify || hasAppleMusic">
      you're connected to {{ serviceName }}
    </p>

    <p v-else>
      the best way to listen on jam buds is to use a spotify or apple music
      account, if you have one.
    </p>

    <streaming-service-connect />
  </main-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import MainWrapper from '~/components/MainWrapper.vue';
import PageHeader from '~/components/PageHeader.vue';
import StreamingServiceConnect from '~/components/settings/StreamingServiceConnect.vue';

export default {
  components: {
    MainWrapper,
    PageHeader,
    StreamingServiceConnect,
  },

  head() {
    return {
      title: 'streaming settings',
    };
  },

  computed: {
    ...mapState({
      hasSpotify: (state) => state.streaming.hasSpotify,
      hasAppleMusic: (state) => state.streaming.hasAppleMusic,
      serviceName: (state) =>
        state.streaming.hasSpotify ? 'Spotify' : 'Apple Music',
    }),
  },
};
</script>