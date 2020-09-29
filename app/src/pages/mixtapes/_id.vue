<template>
  <main-wrapper :with-color-scheme-override="true">
    <template v-if="mixtape">
      <share-landing-banner>
        <nuxt-link to="/">sign up</nuxt-link>to listen to this mixtape in your
        browser by connecting spotify or apple music!
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
        <span v-if="isOwnMixtape">your mixtape</span>
        <span v-else>
          a mixtape by
          <nuxt-link :to="`/users/${mixtape.author.name}`">
            {{ mixtape.author.name }}
          </nuxt-link>
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
        <p>this mixtape is in draft mode. would you like to publish it?</p>
        <publish-button :mixtape="mixtape" />
      </panel>

      <template v-if="$fetchState.pending">
        <!-- ... loading ... -->
      </template>
      <template v-else-if="mixtape.tracks.length > 0">
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
      />
    </template>
  </main-wrapper>
</template>

<script>
import Mixtape from '../../components/mixtapes/Mixtape.vue';
import MainWrapper from '../../components/MainWrapper.vue';
import AddSongButton from '../../components/AddSongButton.vue';
import AddSongModal from '../../components/new-song-modal/AddSongModal.vue';
import EditableTitle from '../../components/mixtapes/EditableTitle.vue';
import PublishButton from '../../components/mixtapes/PublishButton.vue';
import Panel from '../../components/Panel.vue';
import ShareLandingBanner from '../../components/ShareLandingBanner.vue';
import getMixtapeArt from '../../util/getMixtapeArt';
import { showModal } from '~/util/modal.js';

export default {
  components: {
    Mixtape,
    MainWrapper,
    AddSongButton,
    AddSongModal,
    EditableTitle,
    PublishButton,
    Panel,
    ShareLandingBanner,
  },

  head() {
    if (!this.mixtape) {
      return;
    }

    return {
      title: this.mixtape.title,

      meta: [
        { name: 'twitter:card', content: 'summary' },
        { hid: 'title', name: 'og:title', content: this.mixtape.title },
        {
          hid: 'description',
          name: 'og:description',
          content: `check out this mixtape by ${this.mixtape.author.name} on jam buds!`,
        },
        {
          name: 'og:image',
          content: getMixtapeArt(this.mixtape.id),
        },
      ],
    };
  },

  async fetch() {
    const mixtapeId = this.$route.params.id;
    const { mixtape, author } = await this.$store.dispatch(
      'loadMixtape',
      mixtapeId
    );
    // this is also done when navigating in - see <mixtape-item>
    this.$store.dispatch('colorScheme/setOverrideFromProfile', author.name);

    if (this.$route.params.slug !== mixtape.slug) {
      this.$nuxt.context.redirect(`/mixtapes/${mixtapeId}/${mixtape.slug}`);
    }
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
        !this.mixtape.publishedAt
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
      showModal(this.$router, this.$route, 'add-song');
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
        this.$store.dispatch('removeMixtapeFromCache', { mixtapeId });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

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
