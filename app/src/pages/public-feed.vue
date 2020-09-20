<template>
  <main-wrapper>
    <public-feed />
  </main-wrapper>
</template>

<script>
import PublicFeed from '../components/PublicFeed.vue';
import MainWrapper from '../components/MainWrapper.vue';

export default {
  components: {
    PublicFeed,
    MainWrapper,
  },
};
</script>
