<template>
  <div class="note-box">
    <textarea
      data-test="note-field"
      :value="value"
      @input="updateText($event.target.value)"
      placeholder="write what u think here"
    />
    <div :style="{ marginTop: '12px' }">
      ({{ remainingChars }} characters left)
    </div>
  </div>
</template>

<script>
export const MAX_POST_LENGTH = 500;

export default {
  props: ['value'],

  computed: {
    remainingChars() {
      return MAX_POST_LENGTH - this.value.length;
    },
  },

  methods: {
    updateText(value) {
      this.$emit('input', value);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.note-box textarea {
  display: block;
  font-family: 'Work Sans', sans-serif;
  font-size: 16px;
  line-height: 20px;
  width: 100%;
  height: 120px;
  background: #efefef;
  color: black;
  border: none;
  border-radius: 5px;
  resize: none;
  padding: 1em;
}
</style>
