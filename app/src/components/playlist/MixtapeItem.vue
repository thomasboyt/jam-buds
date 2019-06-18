<template>
  <div>
    <entry-posted-by
      :names="[mixtape.authorName]"
      :timestamp="timestamp"
      verb="posted"
    />

    <router-link class="playlist-mixtape" :to="mixtapeLink">
      <img class="art" :src="art" />

      <div class="label">
        <div class="label-content">
          <span class="title">{{ mixtape.title }}</span
          ><br />
          a mixtape by {{ mixtape.authorName }}
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
import EntryPostedBy from './EntryPostedBy.vue';

const arts = [
  require('../../../assets/mixtape_icons/cd-1.jpg'),
  require('../../../assets/mixtape_icons/cd-2.jpg'),
  require('../../../assets/mixtape_icons/cd-3.jpg'),
];

export default {
  components: { EntryPostedBy },

  props: ['mixtape', 'timestamp'],

  computed: {
    art() {
      const artIdx = this.mixtape.id % 3;
      return arts[artIdx];
    },

    mixtapeLink() {
      return `/mixtapes/${this.mixtape.id}`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../styles/mixins.scss';

.playlist-mixtape {
  display: block;

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
  width: 64px;
  height: auto;
  margin-right: 20px;
}

.label {
  line-height: 24px;

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
    width: 48px;
  }

  .label {
    font-size: 14px;
    line-height: 20px;
  }

  .actions /deep/ .action-button {
    margin-left: 5px;

    .icon {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
