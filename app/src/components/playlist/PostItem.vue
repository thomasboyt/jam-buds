<template>
  <div v-if="item.type === 'song'">
    <entry-posted-by
      :timestamp="item.timestamp"
      :names="postedUserNames"
      :verb="verb"
    />
    <song
      :song-id="item.songId"
      :posted-user-names="postedUserNames"
      @requestPlay="handleRequestPlay"
    />
    <notes v-if="notes.length > 0" :notes="notes" />
  </div>
  <mixtape-item
    v-else-if="item.type === 'mixtape'"
    :timestamp="item.timestamp"
    :mixtape="item.mixtape"
  />
</template>

<script>
import Song from './Song.vue';
import EntryPostedBy from './EntryPostedBy.vue';
import MixtapeItem from './MixtapeItem.vue';
import Notes from './Notes.vue';

export default {
  components: { Song, EntryPostedBy, MixtapeItem, Notes },

  props: ['item', 'verb', 'userName'],

  computed: {
    postedUserNames() {
      return this.item.posts && this.item.posts.map((post) => post.userName);
    },

    notes() {
      if (this.item.posts) {
        return this.item.posts
          .filter((post) => post.noteText)
          .map((post) => {
            return {
              authorName: post.userName,
              text: post.noteText,
              postId: post.postId,
            };
          });
      } else if (this.item.noteText) {
        return [
          {
            authorName: this.userName,
            text: this.item.noteText,
            postId: this.item.postId,
          },
        ];
      }
      return [];
    },
  },

  methods: {
    handleRequestPlay() {
      this.$emit('requestPlay', this.item.songId);
    },
  },
};
</script>
