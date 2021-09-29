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

<script lang="ts">
import Vue, { PropType } from 'vue'; // eslint-disable-line import/named
import { ApiSchema } from '~/api/_helpers';
import { getSpotifyAlbumUrl, getSpotifySongUrl } from '~/util/getSpotifyUrl';
import getYoutubeSearchUrl from '../../util/getYoutubeSearchUrl';
import { SelectedItem } from './common';
import ServiceListItem from './ServiceListItem.vue';

export default Vue.extend({
  components: { ServiceListItem },

  props: {
    details: {
      type: Object as PropType<ApiSchema<'SearchDetailsResponse'>>,
    },
    item: {
      type: Object as PropType<SelectedItem>,
    },
    type: {
      type: String as PropType<'album' | 'song'>,
    },
  },

  computed: {
    youtubeSearchUrl(): string {
      return getYoutubeSearchUrl(this.item);
    },
    spotifyUrl(): string {
      if (this.type === 'album') {
        return getSpotifyAlbumUrl(this.details.spotifyId);
      } else {
        return getSpotifySongUrl(this.details.spotifyId);
      }
    },
  },
});
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
