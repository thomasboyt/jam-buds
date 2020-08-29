<template>
  <div v-if="!items.length" class="main-placeholder">
    <slot name="placeholder" />
  </div>

  <div v-else>
    <ul class="playlist-entries">
      <li v-for="item in items" :key="item.id">
        <slot name="item" :item="item" />
      </li>
    </ul>

    <div v-if="!itemsExhausted">
      <div v-if="loadingNextPage">Loading...</div>

      <a v-else href="#" @click="handleRequestNextPage"> Load next page </a>
    </div>

    <connect-streaming-banner />
  </div>
</template>

<script>
import ConnectStreamingBanner from './ConnectStreamingBanner.vue';

export default {
  components: { ConnectStreamingBanner },

  props: ['items', 'itemsExhausted', 'loadingNextPage'],

  methods: {
    handleRequestNextPage(evt) {
      evt.preventDefault();
      this.$emit('requestNextPage');
    },
  },
};
</script>

<style lang="scss" scoped>
ul.playlist-entries {
  list-style-type: none;
  padding-left: 0px;
  margin-top: 0px;
}
</style>
