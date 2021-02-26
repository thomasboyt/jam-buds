<template>
  <div class="service-list">
    <ul>
      <li>
        <span v-if="details.spotifyId">✅</span><span v-else>❌</span> spotify
      </li>
      <li>
        <span v-if="details.appleMusicId"
          >✅
          <a
            :href="details.appleMusicUrl"
            target="_blank"
            rel="noopener noreferrer"
            >apple music</a
          ></span
        ><span v-else>❌ apple music</span>
      </li>
      <li>
        ✅
        <a :href="youtubeSearchUrl" target="_blank" rel="noopener noreferrer">
          youtube
        </a>
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

  ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    li {
      margin-left: 20px;

      &:first-child {
        margin-left: 0px;
      }
    }
  }
}
</style>
