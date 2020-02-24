<template>
  <div
    :style="{ marginLeft: '84px', marginTop: '-10px', marginBottom: '20px' }"
  >
    <p
      v-for="note in notes"
      :key="note.authorName"
      :style="{
        background: 'rgba(0, 0, 0, 0.05)',
        margin: 0,
        marginBottom: '10px',
        padding: '10px',
      }"
    >
      <span :style="{ fontWeight: 600 }">{{ note.authorName }}: </span>
      <em>
        {{ note.text }}
        <a href="#" :style="{ fontSize: '12px' }">(flag)</a>
      </em>
    </p>
  </div>
</template>

<script>
export default {
  props: ['notes'],
};
</script>