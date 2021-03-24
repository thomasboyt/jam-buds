<template>
  <main-wrapper>
    <page-header title="streaming settings" />

    <p v-if="serviceName">you're connected to {{ serviceName }}</p>

    <p v-else>
      the best way to listen on jam buds is to use a spotify or apple music
      account, if you have one.
    </p>

    <streaming-service-connect />
  </main-wrapper>
</template>

<script>
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
    serviceName() {
      return this.$store.getters.streamingServiceName;
    },
  },
};
</script>
