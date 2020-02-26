<template>
  <div class="notes-container">
    <p v-for="note in notes" :key="note.authorName" class="note">
      <span :style="{ fontWeight: 600 }">{{ note.authorName }}: </span>
      {{ note.text }}
      <!-- <a href="#" :style="{ fontSize: '12px' }">(flag)</a> -->
    </p>
  </div>
</template>

<script>
export default {
  props: ['notes'],
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
</style>