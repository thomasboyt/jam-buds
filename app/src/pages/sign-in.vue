<template>
  <div class="sign-in-wrapper">
    <p>
      This link should ✨magically✨ log you in to the Jam Buds native app! If
      you're seeing this, you probably opened this link on a device that does
      not have the app installed.
    </p>
    <p>
      If you've opened this on a device with the Jam Buds app installed and
      you're still seeing this, please reach out to us at
      <a href="mailto:hello@jambuds.club">hello@jambuds.club</a> and we'll get
      you sorted.
    </p>
  </div>
</template>

<script>
export default {
  async middleware({ app, query, redirect, res }) {
    const token = query.t;
    const dest = query.dest;

    if (!token) {
      // redirect to home if missing token
      redirect('/');
    }

    if (process.server) {
      if (!dest) {
        try {
          const signInResp = await app.$axios({
            url: '/sign-in',
            method: 'POST',
            data: {
              signInToken: token,
            },
          });
          // forward along the cookie from the API
          const setCookie = signInResp.headers['set-cookie'];
          res.setHeader('set-cookie', setCookie);
          redirect('/');
        } catch (err) {
          console.error(err);
          redirect('/?sign-in-error');
        }
      }
    } else {
      // don't handle client-side renders
      redirect('/');
    }
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.sign-in-wrapper {
  flex: 1;
  padding: 10px;

  @media (max-width: $breakpoint-small) {
    padding-top: 100px;
  }
  @media (min-width: $breakpoint-small) {
    padding-top: 25px;
  }
}
</style>
