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

<script lang="ts">
import Vue, { PropType } from 'vue'; // eslint-disable-line import/named
import { ApiSchema } from '~/api/_helpers';

export default Vue.extend({
  props: {
    mixtapes: {
      type: Array as PropType<ApiSchema<'MixtapePreview'>[]>,
      required: true,
    },
  },

  methods: {
    setColorScheme(mixtape: ApiSchema<'MixtapePreview'>) {
      this.$accessor.colorScheme.setOverrideFromProfile(mixtape.authorName);
    },
  },
});
</script>
