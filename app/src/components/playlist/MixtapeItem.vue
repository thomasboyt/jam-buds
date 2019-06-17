<template>
  <div>{{ mixtape.title }} - {{ mixtape.author.name }}</div>
</template>

<script>
export default {
  props: ['mixtape'],
};
</script>
