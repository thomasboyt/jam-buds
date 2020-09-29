<template>
  <div>
    <nuxt-link
      class="playlist-mixtape"
      :to="mixtapeLink"
      @click.native="setColorScheme"
    >
      <img class="art" :src="art" />

      <div class="label">
        <div class="label-content">
          <span class="title">{{ mixtape.title }}</span
          ><br />
          a mixtape by {{ mixtape.authorName }} with
          {{ mixtape.songCount }} tracks
        </div>
      </div>
    </nuxt-link>
  </div>
</template>

<script>
import getMixtapeArt from '../../util/getMixtapeArt';

export default {
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

.art {
  flex: 0 0 auto;
  width: 64px;
  height: auto;
  margin-right: 20px;
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

  .art {
    margin-right: 10px;
    width: 54px;
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
