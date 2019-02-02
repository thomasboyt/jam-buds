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

<style scoped lang="scss">
.logged-out-homepage {
  position: relative;

  max-width: 600px;
  min-height: 850px;
  margin: 0 auto;
  margin-bottom: 80px;
  padding: 0 20px;
  padding-bottom: 50px;

  background-image: url('../../assets/ghettoblaster_corgi.png');
  background-color: white;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 15px hotpink solid;

  text-align: center;

  h2 {
    margin-top: 32px;
    font-size: 48px;
  }

  .lower {
    margin-top: 460px;
  }

  .twitter-auth {
    margin-top: 30px;
  }

  .twitter-auth .button {
    display: inline-block;
    margin: 10px auto;
    padding: 10px;
    text-decoration: none;

    background-color: yellow;
    color: black;
    font-weight: bold;
    font-size: 1.5em;

    &:active {
      transform: translate3d(4px, 4px, 0px);
    }
  }

  .attribution {
    position: absolute;
    text-align: center;
    left: 0;
    right: 0;
    bottom: 15px;

    font-size: 12px;

    a,
    a:visited,
    a:hover,
    a:active {
      color: hotpink;
    }
  }
}
</style>
