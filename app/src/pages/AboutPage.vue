<template>
  <sidebar-wrapper>
    <main-wrapper>
      <h2>what is this thing</h2>

      <p>
        this is <strong>jam buds</strong>, a site to share music with friends
      </p>

      <p>
        you can post songs you like, follow your friends, and listen to what
        everyone you know is listening to.
      </p>

      <h2>who's responsible for this mess</h2>

      <p>
        this site was built by <a href="https://thomasboyt.com/">thomas</a>. if
        you want to yell at him, you can do so on
        <a href="https://twitter.com/thomasABoyt">twitter</a>. you can also
        <router-link to="/users/thomasABoyt">follow him on here</router-link> if
        you'd like.
      </p>

      <p>
        in addition, this site uses the following assets:
      </p>

      <h3>images</h3>

      <ul>
        <li>
          very good dog by
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
