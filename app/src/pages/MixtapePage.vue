<template>
  <sidebar-wrapper v-slot="{ withSidebar }">
    <main-wrapper
      :with-sidebar="withSidebar"
      :with-color-scheme-override="true"
      :color-scheme="mixtape.author.colorScheme"
    >
      <share-landing-banner>
        <router-link to="/">sign up</router-link>
        to listen to this mixtape in your browser by connecting spotify or apple
        music!
      </share-landing-banner>

      <editable-title
        v-if="isEditing"
        :mixtape="mixtape"
        :editing="editingTitle"
        @enter="handleEnterEditTitle"
        @exit="handleExitEditTitle"
      />

      <h2 v-else>{{ mixtape.title }}</h2>

      <p class="mixtape-meta">
        <span v-if="isOwnMixtape">
          your mixtape
        </span>
        <span v-else>
          a mixtape by
          <router-link :to="`/users/${mixtape.author.name}`">{{
            mixtape.author.name
          }}</router-link>
        </span>

        <span v-if="!isEditing">&middot; posted {{ publishedAt }}</span>

        <span v-if="isOwnMixtape">
          <span v-if="isEditing">
            &middot;
            <button class="link-button" @click="handleEnterEditTitle">
              rename
            </button>
          </span>
          &middot;
          <button class="link-button" @click="handleDelete">delete</button>
        </span>
      </p>

      <panel v-if="isEditing">
        <p>
          this mixtape is in draft mode. would you like to publish it?
        </p>
        <publish-button :mixtape="mixtape" />
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

      <add-song-modal
        v-if="isEditing"
        title="add to mixtape"
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
import AddSongModal from '../components/new-song-modal/AddSongModal.vue';
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
    AddSongModal,
    EditableTitle,
    PublishButton,
    Panel,
    ShareLandingBanner,
  },

  async asyncData({ store, route }) {
    await store.dispatch('loadMixtape', route.params.id);
  },

  metaInfo() {
    if (!this.mixtape) {
      return;
    }

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
      addSongOpen: false,
      editingTitle: false,
    };
  },

  computed: {
    mixtapeId() {
      return this.$route.params.id;
    },

    mixtape() {
      return this.$store.getters.getMixtape(this.mixtapeId);
    },

    isOwnMixtape() {
      return this.mixtape.author.name === this.$store.state.currentUser.name;
    },

    isEditing() {
      return (
        this.mixtape.author.id === this.$store.state.currentUser.id &&
        !this.mixtape.isPublished
      );
    },

    publishedAt() {
      const date = new Date(this.mixtape.publishedAt);
      return date.toLocaleDateString('default', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },

  methods: {
    handleAddSongOpen() {
      this.addSongOpen = true;
    },

    handleAddSongClose() {
      this.addSongOpen = false;
    },

    handleEnterEditTitle() {
      this.editingTitle = true;
    },

    handleExitEditTitle() {
      this.editingTitle = false;
    },

    async handleDelete() {
      const confirmed = window.confirm(
        'Are you sure you want to delete this mixtape?'
      );

      if (!confirmed) {
        return;
      }

      const { mixtapeId } = this;

      try {
        await this.$store.dispatch('deleteMixtape', {
          mixtapeId,
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      }

      this.$router.push('/', () => {
        this.$store.commit('removeMixtape', { mixtapeId });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/mixins.scss';

ul.playlist-entries {
  list-style-type: none;
  padding-left: 0px;
}

.mixtape-meta {
  font-size: 18px;

  @media (max-width: $breakpoint-small) {
    font-size: 16px;
  }
}

.rename-button {
  margin-left: 6px;
  margin-bottom: 12px;
  text-decoration: underline;
}

.link-button {
  text-decoration: underline;
  padding: 0;

  &:hover {
    text-decoration: none;
  }
}
</style>
