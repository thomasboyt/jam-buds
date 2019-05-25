<template>
  <sidebar-wrapper v-slot="{ withSidebar }">
    <main-wrapper :with-sidebar="withSidebar">
      <h2>what is this thing</h2>

      <p>
        this is <strong>jam buds</strong>, a site to share music with friends
      </p>

      <p>
        you can post songs you like, follow your friends, and listen to what
        everyone you know is listening to.
      </p>

      <h2>something's broken / i have an idea</h2>

      <p>
        jam buds is under active development and exists in a constant state of
        on-fire-ness. you can check
        <a
          href="https://www.notion.so/thomasboyt/d4cf1e506401423094ff46ea977451b0?v=6f1d9cb6cfe44adabd4cd8f4f2072da9"
          >the public issue tracker</a
        >
        to see if your idea is on the drawing board, or if the bug you noticed
        is already known. otherwise, feel free to reach out at
        <a href="mailto:hello@jambuds.club">hello@jambuds.club</a>!
      </p>

      <h2>who's responsible for this mess</h2>

      <p>
        this site was built by <a href="https://thomasboyt.com/">thomas</a>, who
        feels weird writing this in the third person. you can also
        <router-link to="/users/thomas">follow him on here</router-link> if
        you'd like.
      </p>

      <p>
        in addition, this site uses the following assets:
      </p>

      <h3>images</h3>

      <ul>
        <li>
          very good dog(s) by
          <a href="http://twitter.com/rainbowfission">@rainbowfission</a>
        </li>
      </ul>

      <h3>icons</h3>

      <ul>
        <li>Record by Clayton Meador from the Noun Project</li>
        <li>play by Alex Fuller from the Noun Project</li>
        <li>pause by Alex Fuller from the Noun Project</li>
        <li>Skip Forward by Alex Fuller from the Noun Project</li>
        <li>menu by Ismael Ruiz from the Noun Project</li>
      </ul>

      <h2>nerd things</h2>

      <p>
        the code for jam buds is open source and viewable
        <a href="https://github.com/thomasboyt/jam-buds">on github</a>
      </p>

      <!-- <p v-if="buildSha">
        running client version {{buildSha}}
      </p> -->
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import SidebarWrapper from '../components/SidebarWrapper.vue';
import MainWrapper from '../components/MainWrapper.vue';
import titleMixin from '../util/titleMixin';

export default {
  components: { SidebarWrapper, MainWrapper },

  mixins: [titleMixin],

  title: 'About',

  data() {
    return {
      // buildSha: process.env.BUILD_SHA,
    };
  },
};
</script>
