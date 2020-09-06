<!-- unused for now but keeping around for some kind of "collapsed view" -->

<template>
  <span>
    <span v-for="(name, idx) in sortedNames" :key="name">
      <span v-if="idx !== 0">
        <span v-if="names.length === 2"> and </span>
        <span v-else>
          <span v-if="idx === sortedNames.length - 1">, and </span>
          <span v-else>, </span>
        </span>
      </span>

      <span v-if="name === currentUserName">You</span>
      <span v-else>
        <nuxt-link :to="`/users/${name}`">{{ name }}</nuxt-link>
      </span>
    </span>
  </span>
</template>

<script>
import _get from 'lodash/get';

export default {
  props: ['names'],

  computed: {
    // Always put your name at the start of the list
    sortedNames() {
      const ownNameIndex = this.names.indexOf(this.currentUserName);

      if (ownNameIndex !== -1) {
        return [
          this.currentUserName,
          ...this.names.slice(0, ownNameIndex),
          ...this.names.slice(ownNameIndex + 1),
        ];
      }

      return this.names;
    },

    currentUserName() {
      return _get(this.$store.state.currentUser, 'name');
    },
  },
};
</script>
