<template>
  <modal title="find friends" :is-open="isOpen">
    <p>
      jam buds is more fun with more pals! make sure to check out the
      <nuxt-link to="/public-feed">public feed</nuxt-link> too to find more
      folks to follow.
    </p>

    <div class="section">
      <h3>find by username</h3>
      <find-by-username-form />
    </div>

    <div class="section">
      <h3>find on twitter</h3>
      <twitter-suggestions />
    </div>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import Modal from '../Modal.vue';
import TwitterSuggestions from './TwitterSuggestions.vue';
import FindByUsernameForm from './FindByUsernameForm.vue';

export default Vue.extend({
  components: {
    Modal,
    TwitterSuggestions,
    FindByUsernameForm,
  },

  computed: {
    isOpen() {
      return this.$route.query.modal === 'find-friends';
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

h3 {
  @include heading-sm();
}

.section {
  margin-top: 24px;
  margin-bottom: 24px;
}
</style>
