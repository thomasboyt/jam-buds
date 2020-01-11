<template>
  <form v-if="editing" @submit="handleSubmit">
    <h2 v-if="editing">
      <input
        class="title-input"
        v-model="value"
        ref="titleInput"
        :disabled="requestInFlight"
      />
    </h2>

    <button type="submit" class="save-button" :disabled="requestInFlight">
      Save
    </button>
  </form>

  <button v-else class="enter-button" type="button" @click="enterEditMode">
    <h2>{{ mixtape.title }}</h2>
  </button>
</template>

<script>
export default {
  props: ['mixtape', 'editing'],

  data() {
    return {
      requestInFlight: false,
      value: this.mixtape.title,
    };
  },

  watch: {
    editing(newVal, oldVal) {
      // focus input when we enter editing state
      // nextTick() fixes input not being rendered yet!
      if (newVal === true && oldVal === false) {
        this.$nextTick(() => {
          this.$refs.titleInput.focus();
        }, 0);
      }
    },
  },

  methods: {
    enterEditMode() {
      this.$emit('enter');
    },

    async handleSubmit(e) {
      e.preventDefault();

      this.requestInFlight = true;

      try {
        await this.$store.dispatch('renameMixtape', {
          mixtapeId: this.mixtape.id,
          title: this.value,
        });

        this.$router.replace({
          name: 'mixtape-with-slug',
          params: { id: this.mixtape.id, slug: this.mixtape.slug },
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      } finally {
        this.requestInFlight = false;
      }

      this.$emit('exit');
    },
  },
};
</script>

<style scoped lang="scss">
@import '~/assets/styles/mixins.scss';

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
