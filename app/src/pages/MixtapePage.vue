<template>
  <sidebar-wrapper v-slot="{ withSidebar }">
    <main-wrapper
      :with-sidebar="withSidebar"
      :color-scheme="mixtape.author.colorScheme"
    >
      <editable-title :mixtape="mixtape" />

      <p :style="{ fontSize: '18px' }">
        a playlist by
        <router-link :to="`/users/${mixtape.author.name}`">{{
          mixtape.author.name
        }}</router-link>
      </p>

      <panel>
        <p>
          this mixtape is in draft mode. would you like to publish it?
        </p>
        <publish-button />
      </panel>

      <mixtape :mixtape-id="$route.params.id" />

      <add-song-button @click="handleAddSongOpen">+ add a song</add-song-button>

      <add-to-mixtape-modal
        :mixtape-id="mixtapeId"
        :is-open="addSongOpen"
        @close="handleAddSongClose"
      />
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import Mixtape from '../components/mixtapes/Mixtape.vue';
import MainWrapper from '../components/MainWrapper.vue';
import SidebarWrapper from '../components/SidebarWrapper.vue';
import AddSongButton from '../components/AddSongButton.vue';
import AddToMixtapeModal from '../components/new-song-modal/AddToMixtapeModal.vue';
import EditableTitle from '../components/mixtapes/EditableTitle.vue';
import PublishButton from '../components/mixtapes/PublishButton.vue';
import Panel from '../components/Panel.vue';

export default {
  components: {
    Mixtape,
    MainWrapper,
    SidebarWrapper,
    AddSongButton,
    AddToMixtapeModal,
    EditableTitle,
    PublishButton,
    Panel,
  },

  async asyncData({ store, route }) {
    await store.dispatch('loadMixtape', route.params.id);
  },

  data() {
    return {
      mixtapeId: this.$route.params.id,
      addSongOpen: false,
    };
  },

  computed: {
    mixtape() {
      return this.$store.getters.getMixtape(this.mixtapeId);
    },
  },

  methods: {
    handleAddSongOpen() {
      this.addSongOpen = true;
    },
    handleAddSongClose() {
      this.addSongOpen = false;
    },
  },
};
</script>

<style lang="scss" scoped>
ul.playlist-entries {
  list-style-type: none;
  padding-left: 0px;
}

.rename-button {
  margin-left: 6px;
  margin-bottom: 12px;
  text-decoration: underline;
}
</style>
