<template>
  <div class="service-list">
    <p>your pals will be able to stream this song on:</p>

    <ul>
      <li>
        <span v-if="details.spotifyId">✅</span><span v-else>❌</span> spotify
      </li>
      <li>
        <span v-if="details.appleMusicId">✅</span><span v-else>❌</span> apple
        music
      </li>
      <li>
        ✅ youtube
        <a :href="youtubeSearchUrl" target="_blank" rel="noopener noreferrer"
          >(preview search)</a
        >
      </li>
    </ul>
  </div>
</template>

<script>
import getYoutubeSearchUrl from '../../util/getYoutubeSearchUrl';

export default {
  props: ['details', 'song'],

  computed: {
    youtubeSearchUrl() {
      return getYoutubeSearchUrl(this.song);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.service-list {
  text-align: left;
  margin-bottom: 1em;

  ul {
    margin: 0;
    li {
      line-height: 2em;
    }
  }

  @media (max-width: $breakpoint-small) {
    font-size: 14px;
    line-height: 20px;
  }
}
</style>
