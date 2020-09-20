<template>
  <main-wrapper>
    <h2>about jam buds</h2>

    <h3>what is this thing</h3>

    <p>
      this is
      <strong>jam buds</strong>, a site to share music with friends
    </p>

    <p>
      you can post songs you like, follow your friends, and listen to what
      everyone you know is listening to.
    </p>

    <h3>the rules of the place</h3>

    <ul>
      <li>
        <p>
          <strong>
            jam buds is dedicated to providing a harassment-free experience
            for everyone.
          </strong>
          I do not tolerate harassment of participants in any form.
        </p>
      </li>
      <li>
        <p>
          <strong>do not maliciously spam posts.</strong>
          if you are really excited to share a lot of new music you're into,
          that's okay, but if you're clogging up the feed by posting 27 cover
          versions of "who let the dogs out" at once, i will probably remove
          your ability to post to the public feed at the very least. if you
          want to share a whole lot of music at once, consider
          <a
            href="https://jambuds.club/mixtapes/29/who-did-it"
          >a mixtape</a>
          instead!
        </p>
      </li>
    </ul>

    <p>
      to report any violations of the above rules you have experienced, seen,
      or heard about, please reach out to me at
      <a
        href="mailto:hello@jambuds.club"
      >hello@jambuds.club</a>.
    </p>

    <p>I reserve the right to remove any user from the site at any time.</p>

    <h3>something's broken / I have an idea</h3>

    <p>
      jam buds is under active development and exists in a constant state of
      on-fire-ness. you can check
      <a
        href="https://www.notion.so/thomasboyt/d4cf1e506401423094ff46ea977451b0?v=6f1d9cb6cfe44adabd4cd8f4f2072da9"
      >the public issue tracker</a>
      to see if your idea is on the drawing board, or if the bug you noticed
      is already known. otherwise, feel free to reach out at
      <a
        href="mailto:hello@jambuds.club"
      >hello@jambuds.club</a>!
    </p>

    <h3>who's responsible for this mess</h3>

    <p>
      this site was built by
      <a href="https://thomasboyt.com/">thomas</a>, who
      feels weird writing this in the third person. you can
      <nuxt-link to="/users/thomas">follow him on here</nuxt-link>if you'd
      like.
    </p>

    <p>in addition, this site uses the following assets:</p>

    <h4>images</h4>

    <ul>
      <li>
        very good dog(s) by
        <a href="http://twitter.com/rainbowfission">@rainbowfission</a>
      </li>
    </ul>

    <h4>icons</h4>

    <ul>
      <li>Record by Clayton Meador from the Noun Project</li>
      <li>play by Alex Fuller from the Noun Project</li>
      <li>pause by Alex Fuller from the Noun Project</li>
      <li>Skip Forward by Alex Fuller from the Noun Project</li>
      <li>menu by Ismael Ruiz from the Noun Project</li>
    </ul>

    <h3>nerd things</h3>

    <p>
      the code for jam buds is open source and viewable
      <a
        href="https://github.com/thomasboyt/jam-buds"
      >on github</a>. please
      feel free to take a look, but we're not currently accepting outside
      contributions, so don't go opening any PRs!
    </p>

    <!-- <p v-if="buildSha">
        running client version {{buildSha}}
    </p>-->
  </main-wrapper>
</template>

<script>
import MainWrapper from '../components/MainWrapper.vue';

export default {
  components: { MainWrapper },

  head() {
    return {
      title: 'About',
    };
  },

  data() {
    return {
      // buildSha: process.env.BUILD_SHA,
    };
  },
};
</script>
