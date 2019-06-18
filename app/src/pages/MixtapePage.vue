<template>
  <sidebar-wrapper v-slot="{ withSidebar }">
    <main-wrapper
      :with-sidebar="withSidebar"
      :color-scheme="mixtape.author.colorScheme"
    >
      <share-landing-banner>
        <router-link to="/">sign up</router-link>
        to listen to this mixtape in your browser by connecting spotify or apple
        music!
      </share-landing-banner>

      <editable-title v-if="isEditing" :mixtape="mixtape" />
      <h2 v-else>{{ mixtape.title }}</h2>

      <p :style="{ fontSize: '18px' }">
        a mixtape by
        <router-link :to="`/users/${mixtape.author.name}`">{{
          mixtape.author.name
        }}</router-link>
      </p>

      <panel v-if="isEditing">
        <p>
          this mixtape is in draft mode. would you like to publish it?
        </p>
        <publish-button :mixtape-id="$route.params.id" />
      </panel>

      <template v-if="mixtape.tracks.length > 0">
        <mixtape :mixtape-id="$route.params.id" :is-editing="isEditing" />

        <add-song-button @click="handleAddSongOpen" v-if="isEditing"
          >+ add a song</add-song-button
        >
      </template>
      <div v-else class="main-placeholder">
        <add-song-button
          :style="{ margin: '0 auto' }"
          @click="handleAddSongOpen"
          v-if="isEditing"
          >+ add a song</add-song-button
        >
      </div>

      <add-to-mixtape-modal
        :mixtape-id="mixtapeId"
        :is-open="addSongOpen"
        @close="handleAddSongClose"
        v-if="isEditing"
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
import ShareLandingBanner from '../components/ShareLandingBanner.vue';

import getMixtapeArt from '../util/getMixtapeArt';

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
    ShareLandingBanner,
  },

  async asyncData({ store, route }) {
    await store.dispatch('loadMixtape', route.params.id);
  },

  metaInfo() {
    return {
      title: this.mixtape.title,

      meta: [
        { name: 'twitter:card', content: 'summary' },
        { vmid: 'title', name: 'og:title', content: this.mixtape.title },
        {
          vmid: 'description',
          name: 'og:description',
          content: `check out this mixtape by ${
            this.mixtape.author.name
          } on jam buds!`,
        },
        {
          name: 'og:image',
          content: getMixtapeArt(this.mixtape.id),
        },
      ],
    };
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

    isEditing() {
      return (
        this.mixtape.author.id === this.$store.state.currentUser.id &&
        !this.mixtape.isPublished
      );
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
