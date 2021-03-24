<template>
  <main-wrapper>
    <page-header title="notifications" />

    <notifications />
  </main-wrapper>
</template>

<script>
import MainWrapper from '~/components/MainWrapper.vue';
import PageHeader from '~/components/PageHeader.vue';
import Notifications from '~/components/settings/Notifications.vue';

export default {
  components: {
    MainWrapper,
    PageHeader,
    Notifications,
  },

  head() {
    return {
      title: 'notifications',
    };
  },
};
</script>
