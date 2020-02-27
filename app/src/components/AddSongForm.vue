<template>
  <div>
    <form
      class="desktop-form"
      @submit="handleSubmitForm"
      data-test="add-song-form"
    >
      <input
        ref="input"
        v-model="search"
        class="input"
        placeholder="what's ur jam?"
      />
      <add-song-button class="add-song-form-button">
        {{ desktopCta }}
      </add-song-button>
    </form>

    <div class="mobile-button">
      <add-song-button @click="handleSubmit">
        {{ mobileCta }}
      </add-song-button>
    </div>
  </div>
</template>

<script>
import AddSongButton from './AddSongButton.vue';

export default {
  components: { AddSongButton },

  props: ['desktopCta', 'mobileCta'],

  data() {
    return {
      search: '',
    };
  },

  methods: {
    handleSubmitForm(e) {
      e.preventDefault();
      this.handleSubmit();
    },
    handleSubmit() {
      this.$emit('submit', this.search);
      this.search = '';
      if (this.$refs.input) {
        this.$refs.input.blur();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';
@import '~/assets/styles/z-index.scss';

.desktop-form {
  display: none;

  @media (min-width: $breakpoint-small) {
    display: flex;
  }
}

.mobile-button {
  @media (min-width: $breakpoint-small) {
    display: none;
  }
}

.input {
  border: none;
  border-top-left-radius: 100px;
  border-bottom-left-radius: 100px;
  width: 250px;
  padding: 0 16px;
  font-family: 'Work Sans', sans-serif;

  @media (max-width: $breakpoint-small) {
    display: none;
  }
}
</style>
