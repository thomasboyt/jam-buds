<template>
  <div>
    <nuxt-link
      class="playlist-mixtape"
      :to="mixtapeLink"
      @click.native="setColorScheme"
    >
      <album-art :album-art="art" />

      <div class="label">
        <div class="label-content">
          <span class="title">{{ mixtape.title }}</span
          ><br />
          a mixtape by {{ mixtape.authorName }} with
          {{ mixtape.songCount }} tracks
        </div>
        <like-action
          :mobile="true"
          item-type="mixtape"
          :item-id="mixtape.id"
          :is-liked="mixtape.meta.isLiked"
          :like-count="mixtape.meta.likeCount"
        />
      </div>

      <playlist-item-actions>
        <like-action
          item-type="mixtape"
          :item-id="mixtape.id"
          :is-liked="mixtape.meta.isLiked"
          :like-count="mixtape.meta.likeCount"
        />
        <div class="dropdown-action-placeholder" />
      </playlist-item-actions>
    </nuxt-link>
  </div>
</template>

<script>
import getMixtapeArt from '../../util/getMixtapeArt';
import AlbumArt from './AlbumArt.vue';
import LikeAction from './LikeAction.vue';
import PlaylistItemActions from './PlaylistItemActions';

export default {
  components: { AlbumArt, LikeAction, PlaylistItemActions },

  props: ['mixtape'],

  computed: {
    art() {
      return getMixtapeArt(this.mixtape.id);
    },

    mixtapeLink() {
      return `/mixtapes/${this.mixtape.id}/${this.mixtape.slug}`;
    },
  },

  methods: {
    setColorScheme() {
      this.$store.dispatch(
        'colorScheme/setOverrideFromProfile',
        this.mixtape.authorName
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.playlist-mixtape {
  padding: 10px;
  margin: 0 -10px 10px -10px;

  display: flex;
  align-items: center;
  color: var(--theme-text-color);
  text-decoration: none;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
}

.label {
  line-height: 1.5em;
  flex: 1 1 auto;
  overflow-x: hidden;

  > .label-content {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .title {
    font-weight: 500;
  }
}

@media (max-width: $breakpoint-small) {
  .playlist-mixtape {
    padding: 5px;
    margin: 0 -5px 15px -5px;
  }

  .actions ::v-deep .action-button {
    margin-left: 5px;

    .icon {
      width: 20px;
      height: 20px;
    }
  }
}

.dropdown-action-placeholder {
  // magic numbers match size of dropdown button
  width: 41px;
  height: 41px;

  @media (max-width: $breakpoint-small) {
    display: none;
  }
}
</style>
