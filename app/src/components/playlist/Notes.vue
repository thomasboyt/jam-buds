<template>
  <div class="notes-container">
    <p v-for="note in notes" :key="note.postId" class="note">
      <span :style="{ fontWeight: 600 }">{{ note.authorName }}: </span>
      <span class="note-text">{{ note.text }}</span>
      <button class="report-button" @click="handleClickReport(note.postId)">
        (report)
      </button>
    </p>
  </div>
</template>

<script>
export default {
  props: ['notes'],

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
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.notes-container {
  margin-left: 84px;
  margin-top: -10px;
  margin-bottom: 20px;
}

.note {
  background: rgba(0, 0, 0, 0.05);
  margin: 0;
  margin-bottom: 10px;
  padding: 10px;
}

.note-text {
  white-space: pre-line;
}

.report-button {
  font-size: 12px;
  text-decoration: underline;
  padding: 0;
  margin-left: 5px;

  &:hover {
    text-decoration: none;
  }
}
</style>