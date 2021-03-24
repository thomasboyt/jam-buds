<template>
  <div class="service-list">
    <ul>
      <service-list-item
        data-test="service-spotify"
        name="spotify"
        :present="details.spotifyId"
        :url="spotifyUrl"
      />
      <service-list-item
        data-test="service-apple-music"
        name="apple music"
        :present="details.appleMusicId"
        :url="details.appleMusicUrl"
      />
      <service-list-item
        v-if="details.bandcampUrl"
        data-test="service-bandcamp"
        name="bandcamp"
        :present="details.bandcampUrl"
        :url="details.bandcampUrl"
      />
      <service-list-item
        v-else
        name="youtube"
        :present="true"
        :url="youtubeSearchUrl"
      />
    </ul>
  </div>
</template>

<script>
import { getSpotifyAlbumUrl, getSpotifySongUrl } from '~/util/getSpotifyUrl';
import getYoutubeSearchUrl from '../../util/getYoutubeSearchUrl';
import ServiceListItem from './ServiceListItem.vue';

export default {
  components: { ServiceListItem },
  props: ['details', 'item', 'type'],

  computed: {
    youtubeSearchUrl() {
      return getYoutubeSearchUrl(this.item);
    },
    spotifyUrl() {
      if (this.type === 'album') {
        return getSpotifyAlbumUrl(this.details.spotifyId);
      } else {
        return getSpotifySongUrl(this.details.spotifyId);
      }
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
