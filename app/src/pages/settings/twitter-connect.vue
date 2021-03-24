<template>
  <main-wrapper>
    <page-header title="connect to twitter" />

    <twitter-connect />
  </main-wrapper>
</template>

<script>
import MainWrapper from '~/components/MainWrapper.vue';
import PageHeader from '~/components/PageHeader.vue';
import TwitterConnect from '~/components/settings/TwitterConnect.vue';

export default {
  components: {
    MainWrapper,
    PageHeader,
    TwitterConnect,
  },

  head() {
    return {
      title: 'streaming settings',
    };
  },
};
</script>
