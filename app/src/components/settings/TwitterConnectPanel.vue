<template>
  <settings-panel-expanding :title="title" path="/settings/twitter-connect">
    <template v-if="twitterName">
      ppl who follow you at <strong>@{{ twitterName }}</strong> can find you on
      jam buds
    </template>
    <template v-else>you have not connected a Twitter account</template>
    <template #expanded>
      <twitter-connect />
    </template>
  </settings-panel-expanding>
</template>

<script>
import { mapState } from 'vuex';
import SettingsPanelExpanding from './SettingsPanelExpanding.vue';
import TwitterConnect from './TwitterConnect.vue';

export default {
  components: { SettingsPanelExpanding, TwitterConnect },

  computed: {
    ...mapState({
      twitterName: (state) => state.currentUser.twitterName,
    }),

    title() {
      if (this.twitterName) {
        return 'Connected to Twitter';
      } else {
        return 'Connect to Twitter';
      }
    },
  },
};
</script>
