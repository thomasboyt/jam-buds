<template>
  <div>
    <playlist-item-row
      component="nuxt-link"
      :to="mixtapeLink"
      @click.native="setColorScheme"
    >
      <album-art :album-art="art" />

      <playlist-item-label>
        <template #line-one>
          {{ mixtape.title }}
        </template>
        <template #line-two>
          a mixtape by {{ mixtape.authorName }} with
          {{ mixtape.songCount }} tracks
        </template>
        <like-action
          :mobile="true"
          item-type="mixtape"
          :item-id="mixtape.id"
          :is-liked="mixtape.meta.isLiked"
          :like-count="mixtape.meta.likeCount"
        />
      </playlist-item-label>

      <playlist-item-actions>
        <like-action
          item-type="mixtape"
          :item-id="mixtape.id"
          :is-liked="mixtape.meta.isLiked"
          :like-count="mixtape.meta.likeCount"
          :like-source-params="likeSourceParams"
        />
      </playlist-item-actions>
    </playlist-item-row>
  </div>
</template>

<script>
import getMixtapeArt from '../../util/getMixtapeArt';
import AlbumArt from './AlbumArt.vue';
import LikeAction from './LikeAction.vue';
import PlaylistItemActions from './PlaylistItemActions';
import PlaylistItemLabel from './PlaylistItemLabel.vue';
import PlaylistItemRow from './PlaylistItemRow.vue';

export default {
  components: {
    AlbumArt,
    LikeAction,
    PlaylistItemActions,
    PlaylistItemLabel,
    PlaylistItemRow,
  },

  props: ['mixtapeId', 'likeSourceParams'],

  computed: {
    mixtape() {
      return this.$accessor.playlistItems.mixtapes[this.mixtapeId];
    },

    art() {
      return getMixtapeArt(this.mixtape.id);
    },

    mixtapeLink() {
      return `/mixtapes/${this.mixtape.id}/${this.mixtape.slug}`;
    },
  },

  methods: {
    setColorScheme() {
      this.$accessor.colorScheme.setOverrideFromProfile(
        this.mixtape.authorName
      );
    },
  },
};
</script>
