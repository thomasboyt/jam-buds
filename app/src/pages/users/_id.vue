<template>
  <sidebar-wrapper v-slot="{ withSidebar }">
    <main-wrapper
      :with-sidebar="withSidebar"
      :with-color-scheme-override="true"
      :color-scheme="colorScheme"
    >
      <nuxt-child />
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import SidebarWrapper from '../../components/SidebarWrapper.vue';
import MainWrapper from '../../components/MainWrapper.vue';
import with404Handler from '~/util/with404Handler';

export default {
  components: { SidebarWrapper, MainWrapper },

  asyncData({ store, route, error }) {
    return with404Handler(
      error,
      store.dispatch('loadProfileForUser', route.params.id)
    );
  },

  computed: {
    ...mapState({
      colorScheme: (state) => state.profile.user?.colorScheme,
    }),
  },
};
</script>
