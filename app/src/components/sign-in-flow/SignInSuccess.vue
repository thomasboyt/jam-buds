<template>
  <div>
    <sign-in-header>check ur mail!</sign-in-header>
    <p>
      Check your inbox at
      <strong>{{ sentEmail }}</strong>
      for a link to sign in or sign up.
    </p>
    <p class="email-note">
      please allow up to 15 minutes for the email to arrive. due to strange
      forces of computers outside of our control, sometimes our emails may go to
      your "spam" folder, or, in Gmail, the "Promotions" tab.
    </p>
  </div>
</template>

<script>
import SignInHeader from './SignInHeader.vue';

export default {
  components: { SignInHeader },

  props: ['sentEmail'],
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.email-note {
  font-size: $text-xs;
  margin-top: $spacing-sm;
}
</style>
