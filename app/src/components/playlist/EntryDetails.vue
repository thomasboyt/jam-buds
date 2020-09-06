<template>
  <div class="entry-details">
    <div :style="{ display: 'flex' }">
      <div :style="{ 'flex-flow': '0 0 auto' }">
        <template v-if="type === 'userLiked'">
          <span class="date">Liked {{ formattedTimestamp }} ago</span>
        </template>
        <template v-else>
          <nuxt-link :to="`/users/${name}`" :style="{ fontWeight: 600 }">{{
            name
          }}</nuxt-link>
          <span class="date"> ({{ formattedTimestamp }} ago)</span>
        </template>
      </div>

      <div
        v-if="showReport"
        :style="{ 'flex-flow': '0 0 auto', 'margin-left': 'auto' }"
      >
        <button class="report-button" @click="handleClickReport(id)">
          (report)
        </button>
      </div>
    </div>

    <p v-if="!!note" class="note-text">
      {{ note }}
    </p>
  </div>
</template>

<script>
import formatDistance from 'date-fns/formatDistance';

export default {
  props: {
    name: String,
    date: String,
    id: Number,
    note: String,
    type: {
      type: String,
      required: false,
    },
  },

  computed: {
    formattedTimestamp() {
      const addedDate = new Date(this.date);
      return formatDistance(addedDate, new Date());
    },
    showReport() {
      // TODO: should really compare on user ID instead of user name
      return (
        this.type !== 'userLiked' &&
        this.name !== this.$store.state.currentUser.name
      );
    },
  },

  methods: {
    async handleClickReport(postId) {
      const confirmed = window.confirm(
        'Are you sure you want to report this post?'
      );

      if (!confirmed) {
        return;
      }

      try {
        await this.$axios({
          url: `/posts/${postId}/report`,
          method: 'PUT',
        });
      } catch (err) {
        this.$logError(err);
        this.$store.commit('showErrorModal');
        return;
      }

      this.$store.dispatch('setFlashMessage', {
        message: 'Thanks for reporting!',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.entry-details {
  background: rgba(0, 0, 0, 0.05);
  font-size: 14px;
  margin-top: -10px;
  margin-bottom: 20px;
  padding: 10px;
  @media (min-width: $breakpoint-small) {
    /* margin-left: 84px; */
    font-size: 16px;
  }
}

.date {
  font-size: 12px;

  @media (min-width: $breakpoint-small) {
    font-size: 14px;
  }
}

.note-text {
  margin: 0;
  margin-top: 1em;
  white-space: pre-line;
}

.report-button {
  font-size: 12px;
  text-decoration: underline;
  padding: 0;
  margin-left: 5px;
  text-align: right;

  &:hover {
    text-decoration: none;
  }
}
</style>
