<template>
  <panel v-if="promotionActive">
    <h3 :style="{ marginTop: '0px' }">hey!!</h3>

    <p>
      jam buds now has a
      <a href="https://newz.jambuds.club">cool weekly-ish newsletter</a> you can
      read. you can also
      <router-link to="/settings/notifications"
        >subscribe to get it emailed to you</router-link
      >.
    </p>

    <settings-button @click="handleClose">cool, thanks!!</settings-button>
  </panel>
</template>

<script>
import Panel from './Panel.vue';
import SettingsButton from './settings/SettingsButton.vue';

export default {
  components: {
    Panel,
    SettingsButton,
  },

  data() {
    return {
      promotionActive: false,
    };
  },

  // XXX: can't read from localStorage in data() due to server-side rendering,
  // so we do it here
  mounted() {
    if (!localStorage.hideNewsletterPromotion) {
      this.promotionActive = true;
    }
  },

  methods: {
    handleClose() {
      localStorage.hideNewsletterPromotion = true;
      this.promotionActive = false;
    },
  },
};
</script>
