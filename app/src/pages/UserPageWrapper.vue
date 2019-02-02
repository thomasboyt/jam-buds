<template>
  <sidebar-wrapper>
    <main-wrapper :color-scheme="colorScheme">
      <router-view />
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import SidebarWrapper from '../components/SidebarWrapper.vue';
import MainWrapper from '../components/MainWrapper.vue';

export default {
  components: { SidebarWrapper, MainWrapper },

  computed: {
    ...mapState({
      colorScheme: (state) => state.profile.user.colorScheme,
    }),
  },
};
</script>
