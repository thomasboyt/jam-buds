<template>
  <panel>
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
  </panel>
</template>

<script>
import Panel from '~/components/Panel';

export default {
  components: { Panel },

  props: ['mixtapes'],

  methods: {
    setColorScheme(mixtape) {
      this.$store.dispatch(
        'colorScheme/setOverrideFromProfile',
        mixtape.authorName
      );
    },
  },
};
</script>
