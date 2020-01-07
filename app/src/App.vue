<template>
  <app-container>
    <router-view />
  </app-container>
</template>

<script>
import AppContainer from '~/layouts/default.vue';

export default {
  components: { AppContainer },
};
</script>
