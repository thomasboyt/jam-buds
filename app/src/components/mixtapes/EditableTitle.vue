<template>
  <form v-if="editing" @submit="handleSubmit">
    <h2 v-if="editing">
      <input class="title-input" v-model="value" />
    </h2>
    <button type="submit" class="save-button">
      Save
    </button>
  </form>

  <button
    v-else
    class="enter-button"
    type="button"
    @click="enterEditMode"
    :disabled="requestInFlight"
  >
    <h2>{{ mixtape.title }}</h2>
  </button>
</template>

<script>
export default {
  props: ['mixtape'],

  data() {
    return {
      editing: false,
      requestInFlight: false,
      value: '',
    };
  },

  methods: {
    enterEditMode() {
      this.editing = true;
      this.value = this.mixtape.title;
    },

    async handleSubmit(e) {
      e.preventDefault();

      this.editing = false;
      this.requestInFlight = true;

      try {
        await this.$store.dispatch('renameMixtape', {
          mixtapeId: this.mixtape.id,
          title: this.value,
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      } finally {
        this.requestInFlight = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../../styles/mixins.scss';

form {
  display: flex;
  // width: 100%;

  .title-input {
    display: block;
    flex: 1 1 auto;
    width: 100%;
  }

  .save-button {
    flex: 0 0 auto;
  }
}

.save-button {
  display: block;
  width: 100px;

  background: yellow;
  color: black;
  font-weight: bold;
  font-size: 1.5em;
  margin-left: 20px;

  // slightly magic numbers here
  height: 50px;
  margin-top: -5px;
  @media (max-width: $breakpoint-small) {
    height: 42px;
  }
}

.enter-button {
  padding: 0;
  text-align: left;

  &:active {
    transform: none;
  }
}

.title-input {
  border: 0;
  padding: 0;
  padding: 5px 5px;
  margin: -5px -5px;
  font-family: inherit;
  font-weight: inherit;
  font-size: inherit;
  line-height: inherit;
}
</style>