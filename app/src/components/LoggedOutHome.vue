<template>
  <div class="logged-out-homepage">
    <h2>hey! listen!</h2>

    <div class="lower">
      <p>
        this is <strong>jam buds</strong>, a site to share music with friends
      </p>

      <p>
        you can post songs you like, follow your friends, and listen to what
        everyone you know is listening to.
      </p>

      <div class="twitter-auth">
        <p>want to get started?</p>

        <sign-in-form />
      </div>
    </div>

    <div class="attribution">
      site by
      <a href="https://twitter.com/thomasABoyt">thomas</a>
      &middot; good doggo by
      <a href="http://twitter.com/rainbowfission">@rainbowfission</a>
      &middot;
      <router-link to="/about">about jam buds</router-link>
    </div>
  </div>
</template>

<script>
import SignInForm from './SignInForm.vue';

export default {
  components: { SignInForm },
};
</script>
