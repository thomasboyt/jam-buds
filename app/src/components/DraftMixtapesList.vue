<template>
  <div>
    <p>You've started on the following draft mixtapes:</p>
    <ul>
      <li v-for="mixtape of mixtapes" :key="mixtape.id">
        <nuxt-link
          :to="`/mixtapes/${mixtape.id}/${mixtape.slug}`"
          @click.native="setColorScheme(mixtape)"
        >
          {{ mixtape.title }}
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['mixtapes'],

  methods: {
    setColorScheme(mixtape) {
      this.$accessor.colorScheme.setOverrideFromProfile(mixtape.authorName);
    },
  },
};
</script>
