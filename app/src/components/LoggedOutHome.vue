<template>
  <div class="logged-out-home" :style="{ background: gradient }">
    <div class="logged-out-main">
      <div class="left-drawing">
        <img :src="corgi" />
      </div>

      <div class="content">
        <div v-if="sentMailAddress">
          <h2>check ur mail!</h2>
          <p>
            Check your inbox at
            <strong>{{ sentMailAddress }}</strong>
            for a link to sign in or sign up.
          </p>
          <p class="email-note">
            please allow up to 15 minutes for the email to arrive. due to
            strange forces of computers outside of our control, sometimes our
            emails may go to your "spam" folder, or, in Gmail, the "Promotions"
            tab.
          </p>
        </div>

        <div v-else>
          <h2>
            hey, listen!
          </h2>

          <p>
            this is <strong>jam buds</strong>, a site for sharing music with
            friends
          </p>

          <p>
            you can post songs you like, follow your friends, and listen to what
            everyone you know is listening to.
          </p>

          <p>want to get started? <strong>sign up or log in below:</strong></p>

          <sign-in-form @sentMail="handleSentMail" />
          <p class="email-note">
            (fyi: your email is only used for signing up & logging in, and will
            not be used for marketing or spam or any bullshit like that)
          </p>
        </div>
      </div>
    </div>

    <footer>
      <span class="credits">
        site by
        <a href="https://jambuds.club/users/thomas">thomas</a>
        &middot;
      </span>
      <router-link to="/about">about jam buds</router-link> &middot;
      <a href="mailto:hello@jambuds.club">hello@jambuds.club</a>
    </footer>
  </div>
</template>

<script>
import SignInForm from './SignInForm.vue';
import corgi from '../../assets/ghettoblaster_corgi.png';
import getGradient from '../util/gradients';

export default {
  components: { SignInForm },

  data() {
    return {
      corgi,
      gradient: getGradient('jam buds'),
      sentMailAddress: null,
    };
  },

  methods: {
    handleSentMail(emailAddress) {
      this.sentMailAddress = emailAddress;
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../styles/mixins.scss';

.logged-out-home {
  display: flex;
  flex: 1;
  flex-flow: column;
  padding: 20px 20px;
}

.logged-out-main {
  flex: 1;
}

// Desktop two-column layout
@media (min-width: $breakpoint-small) {
  .logged-out-main {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .left-drawing {
    flex: 0 1 auto;
    transform: rotate(-10deg);
  }

  .content {
    flex: 1 1 auto;
    margin-left: 70px;
    max-width: 400px;
  }
}

.left-drawing {
  img {
    max-width: 100%;
    height: auto;
    border: 15px hotpink solid;
  }

  @media (max-width: $breakpoint-small) {
    display: none;
  }
}

.inline-drawing {
  display: block;
  max-height: 200px;
  width: auto;
  border: 10px hotpink solid;
  margin: 0 auto;

  @media (min-width: $breakpoint-small) {
    display: none;
  }
}

h2 {
  line-height: 1em;
  margin-top: 0px;
  margin-bottom: 20px;

  @media (max-width: $breakpoint-small) {
    text-align: center;
    font-size: 48px;
  }
  @media (min-width: $breakpoint-small) {
    font-size: 72px;
  }
}

.email-note {
  font-size: 12px;
}

footer {
  font-size: 14px;
  text-align: center;

  a,
  a:visited,
  a:hover,
  a:active {
    color: black;
    font-weight: 500;
  }

  .credits {
    @media (max-width: $breakpoint-small) {
      display: none;
    }
  }
}
</style>
