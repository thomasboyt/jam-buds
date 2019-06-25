<template>
  <label class="name-field">
    <div class="label-text">pick a name!</div>
    <div class="url-row">
      <div class="url-prefix">jambuds.club/users/</div>
      <input
        class="url-name"
        type="text"
        :placeholder="placeholder"
        :style="inputStyle"
        :value="value"
        @input="handleInput"
      />
    </div>
  </label>
</template>

<script>
import measureTextWidth from '../util/measureTextWidth';

export default {
  props: ['value'],

  data() {
    return {
      placeholder: 'name',
      fontsLoaded: false,
    };
  },

  computed: {
    inputStyle() {
      // goofy declaration of dependency here
      this.fontsLoaded;

      // stub out for SSR
      if (typeof document === 'undefined') {
        return {};
      }

      const font = {
        fontFamily: '"Work Sans", sans-serif',
        fontWeight: '600',
        fontSize: '22px',
      };

      const content = this.value || this.placeholder;
      const contentWidth = measureTextWidth(content, font);
      const placeholderWidth = measureTextWidth(this.placeholder, font);
      const width =
        contentWidth > placeholderWidth ? contentWidth : placeholderWidth;

      return {
        width: `${Math.ceil(width)}px`,
        ...font,
      };
    },
  },

  mounted() {
    // Ensure we re-compute size of input after web fonts load
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        this.fontsLoaded = true;
      });
    }
  },

  methods: {
    handleInput(e) {
      this.$emit('input', e.target.value);
    },
  },
};
</script>

<style lang="scss" scoped>
.name-field {
  text-align: center;
}

.label-text {
  text-align: center;
  font-size: 18px;
  margin-bottom: 5px;
}

.url-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.url-prefix,
.url-name {
  flex: 0 0 auto;
  display: block;
  font-family: 'Work Sans', sans-serif;
  font-size: 22px;
}

.url-prefix {
  @media (max-width: 768px) {
    display: none;
  }
}

.url-name {
  background: none;
  border: none;
  padding: 5px 0;
}
</style>