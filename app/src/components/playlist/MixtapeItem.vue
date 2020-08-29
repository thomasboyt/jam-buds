<template>
  <div>
    <entry-posted-by
      :names="[mixtape.authorName]"
      :timestamp="timestamp"
      verb="posted"
    />

    <nuxt-link class="playlist-mixtape" :to="mixtapeLink">
      <img class="art" :src="art" />

      <div class="label">
        <div class="label-content">
          <span class="title">{{ mixtape.title }}</span
          ><br />
          a mixtape with {{ mixtape.numTracks }} tracks
        </div>
      </div>
    </nuxt-link>
  </div>
</template>

<script>
import EntryPostedBy from './EntryPostedBy.vue';
import getMixtapeArt from '../../util/getMixtapeArt';

export default {
  components: { EntryPostedBy },

  props: ['mixtape', 'timestamp'],

  computed: {
    art() {
      return getMixtapeArt(this.mixtape.id);
    },

    mixtapeLink() {
      return `/mixtapes/${this.mixtape.id}/${this.mixtape.slug}`;
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

.art {
  flex: 0 0 auto;
  width: 64px;
  height: auto;
  margin-right: 20px;
}

.label {
  line-height: 24px;
  flex: 1 1 auto;
  overflow-x: hidden;

  > .label-content {
    display: inline-block;
    width: 100%;

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

  .art {
    margin-right: 10px;
    width: 54px;
  }

  .label {
    font-size: 14px;
    line-height: 20px;
  }

  .actions ::v-deep .action-button {
    margin-left: 5px;

    .icon {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
