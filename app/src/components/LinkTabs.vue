<template>
  <div class="link-tabs">
    <span v-for="(link, idx) of links" :key="link.to">
      <router-link :to="`${linkPrefix || ''}${link.to}`">{{
        link.label
      }}</router-link>
      <span v-if="idx !== links.length - 1">/&nbsp;</span>
    </span>
  </div>
</template>

<script>
export default {
  props: ['linkPrefix', 'links'],
};
</script>


<style scoped>
.link-tabs {
  font-size: 18px;
}

.link-tabs a.router-link-exact-active {
  font-weight: 600;
}
</style:>