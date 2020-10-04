<template>
  <modal title="find friends" :is-open="isOpen">
    <p :style="{ marginBottom: '32px' }">
      jam buds is more fun with more pals! make sure to check out the
      <nuxt-link to="/public-feed">public feed</nuxt-link> too to find more
      folks to follow.
    </p>

    <h3>find by username</h3>
    <find-by-username-form />

    <h3>find on twitter</h3>
    <twitter-suggestions />
  </modal>
</template>

<script>
import Modal from '../Modal';
import TwitterSuggestions from './TwitterSuggestions';
import FindByUsernameForm from './FindByUsernameForm';

export default {
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
};
</script>

<style lang="scss" scoped>
h3 {
  margin-top: 32px;
}
</style>
