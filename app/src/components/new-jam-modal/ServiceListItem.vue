<template>
  <li>
    <span v-if="present" :data-test="present">✅ </span><span v-else>❌ </span>

    <span v-if="present">
      <a :href="url" target="_blank" rel="noopener noreferrer">{{ name }}</a>
    </span>
    <span v-else>{{ name }}</span>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    present: {
      type: Boolean,
    },
    name: {
      type: String,
    },
    url: {
      type: String,
    },
  },
});
</script>
