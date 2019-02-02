<template>
  <sidebar-wrapper>
    <main-wrapper>
      <div class="playlist">
        <router-view />
      </div>
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import SidebarWrapper from '../components/SidebarWrapper.vue';
import MainWrapper from '../components/MainWrapper.vue';

export default {
  components: { SidebarWrapper, MainWrapper },
};
</script>
