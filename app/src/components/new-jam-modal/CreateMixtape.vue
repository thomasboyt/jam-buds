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

<script>
import NewJamField from './NewJamField.vue';
import PostJamButton from './PostJamButton.vue';
import DraftMixtapesList from '../DraftMixtapesList.vue';

export default {
  components: {
    NewJamField,
    PostJamButton,
    DraftMixtapesList,
  },

  props: ['isMixtapeSearch'],

  fetch() {
    return this.$store.dispatch('loadDraftMixtapes');
  },

  data() {
    return {
      requestInFlight: false,
      mixtapeTitle: '',
    };
  },

  computed: {
    draftMixtapes() {
      return this.$store.state.currentUser.draftMixtapes;
    },

    showDraftMixtapes() {
      return (
        !this.$fetchState.pending &&
        !this.$fetchState.error &&
        this.draftMixtapes.length
      );
    },
  },

  methods: {
    async handleCreateMixtape(e) {
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
        this.$store.commit('showErrorModal');
        throw err;
      } finally {
        this.requestInFlight = false;
      }

      const { id, slug } = resp.data.mixtape;
      this.$router.push(`/mixtapes/${id}/${slug}`);
    },
  },
};
</script>

<style lang="scss" scoped>
.mixtape-post-button-container {
  margin-top: 16px;
}

.draft-mixtapes-container {
  margin-top: 24px;
}
</style>
