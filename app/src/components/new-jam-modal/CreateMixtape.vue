<template>
  <div>
    <form @submit="handleCreateMixtape">
      <new-jam-field v-model="mixtapeTitle" />
      <div class="mixtape-post-button-container">
        <post-jam-button type="submit">create mixtape</post-jam-button>
      </div>
    </form>

    <div class="draft-mixtapes-container">
      <draft-mixtapes-list v-if="showDraftMixtapes" :mixtapes="draftMixtapes" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ApiSchema } from '~/api/_helpers';
import NewJamField from './NewJamField.vue';
import PostJamButton from './PostJamButton.vue';
import DraftMixtapesList from '../DraftMixtapesList.vue';

export default Vue.extend({
  components: {
    NewJamField,
    PostJamButton,
    DraftMixtapesList,
  },

  fetch(): Promise<void> {
    return this.$accessor.mixtapes.loadDraftMixtapes();
  },

  data() {
    return {
      requestInFlight: false,
      mixtapeTitle: '',
    };
  },

  computed: {
    draftMixtapes(): ApiSchema<'MixtapePreview'>[] {
      return this.$accessor.mixtapes.draftMixtapes;
    },

    showDraftMixtapes(): boolean {
      return (
        !this.$fetchState.pending &&
        !this.$fetchState.error &&
        this.draftMixtapes.length > 0
      );
    },
  },

  methods: {
    async handleCreateMixtape(e: Event) {
      e.preventDefault();

      if (!this.mixtapeTitle || this.requestInFlight) {
        return;
      }

      this.requestInFlight = true;

      let resp;
      try {
        resp = await this.$axios({
          url: '/mixtapes',
          method: 'POST',
          data: { title: this.mixtapeTitle },
        });
      } catch (err) {
        this.$accessor.showErrorModal();
        throw err;
      } finally {
        this.requestInFlight = false;
      }

      const data = resp.data as ApiSchema<'MixtapeWithSongsReponse'>;
      const { id, slug } = data.mixtape;
      this.$router.push(`/mixtapes/${id}/${slug}`);
    },
  },
});
</script>

<style lang="scss" scoped>
.mixtape-post-button-container {
  margin-top: 16px;
}

.draft-mixtapes-container {
  margin-top: 24px;
}
</style>
