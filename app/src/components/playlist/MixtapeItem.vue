<template>
  <div>
    <router-link :to="`/mixtapes/${mixtape.id}`">
      {{ mixtape.title }} -
      {{ mixtape.authorName }}
    </router-link>
  </div>
</template>

<script>
export default {
  props: ['mixtape'],
};
</script>
