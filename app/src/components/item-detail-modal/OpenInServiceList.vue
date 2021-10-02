<template>
  <ul>
    <li>
      <jb-button
        v-if="item.spotifyId"
        button-style="hollow full-width"
        tag="a"
        target="_blank"
        rel="noopener noreferrer"
        :href="spotifyUrl"
        data-test="link-spotify"
        @click.native="handleOpen"
      >
        Open in Spotify
      </jb-button>
    </li>
    <li>
      <jb-button
        v-if="item.appleMusicUrl"
        button-style="hollow full-width"
        tag="a"
        target="_blank"
        rel="noopener noreferrer"
        :href="item.appleMusicUrl"
        data-test="link-apple-music"
        @click.native="handleOpen"
      >
        Open in Apple Music
      </jb-button>
    </li>
    <li>
      <jb-button
        v-if="item.bandcampUrl"
        button-style="hollow full-width"
        tag="a"
        target="_blank"
        rel="noopener noreferrer"
        :href="item.bandcampUrl"
        data-test="link-bandcamp"
        @click.native="handleOpen"
      >
        Open on Bandcamp
      </jb-button>
    </li>
    <li>
      <jb-button
        v-if="!item.bandcampUrl"
        button-style="hollow full-width"
        tag="a"
        target="_blank"
        rel="noopener noreferrer"
        :href="youtubeSearchUrl"
        data-test="link-youtube"
        @click.native="handleOpen"
      >
        Find on YouTube
      </jb-button>
    </li>
  </ul>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'; // eslint-disable-line import/named
import { ApiSchema } from '~/api/_helpers';
import { getSpotifyAlbumUrl, getSpotifySongUrl } from '~/util/getSpotifyUrl';
import getYoutubeSearchUrl from '../../util/getYoutubeSearchUrl';
import JbButton from '../lib/JbButton.vue';

export default Vue.extend({
  components: { JbButton },

  props: {
    item: {
      type: Object as PropType<ApiSchema<'SongWithMeta'>>,
      required: true,
    },
    type: {
      type: String as PropType<'album' | 'song'>,
      required: true,
    },
  },

  computed: {
    youtubeSearchUrl(): string {
      return getYoutubeSearchUrl(this.item);
    },
    spotifyUrl(): string {
      if (this.type === 'album') {
        return getSpotifyAlbumUrl(this.item.spotifyId!);
      } else {
        return getSpotifySongUrl(this.item.spotifyId!);
      }
    },
  },

  methods: {
    handleOpen() {
      this.$emit('opened');
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

li + li {
  margin-top: $spacing-sm;
}
</style>
