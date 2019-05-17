<template>
  <sidebar-wrapper v-slot="{ withSidebar }">
    <main-wrapper
      :with-sidebar="withSidebar"
      :color-scheme="{ backgroundColor: 'skyblue', textColor: 'black' }"
    >
      <add-song-flow />
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import SidebarWrapper from '../components/SidebarWrapper.vue';
import MainWrapper from '../components/MainWrapper.vue';
import AddSongFlow from '../components/new-song-modal/AddSongFlow.vue';
import titleMixin from '../util/titleMixin';

export default {
  components: {
    SidebarWrapper,
    MainWrapper,
    AddSongFlow,
  },

  mixins: [titleMixin],

  title: 'Add Song',
};
</script>
