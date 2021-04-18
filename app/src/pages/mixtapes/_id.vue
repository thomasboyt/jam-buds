<template>
  <main-wrapper :with-color-scheme-override="true" :fetch-state="$fetchState">
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

      <page-header v-else :title="mixtape.title" />

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

        <post-jam-button @click="handleAddSongOpen" v-if="isEditing"
          >+ add a song</post-jam-button
        >
      </template>
      <page-placeholder v-else>
        <post-jam-button
          :style="{ margin: '0 auto' }"
          @click="handleAddSongOpen"
          v-if="isEditing"
          >+ add a song</post-jam-button
        >
      </page-placeholder>

      <new-jam-modal
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
import PostJamButton from '../../components/PostJamButton.vue';
import NewJamModal from '../../components/new-jam-modal/NewJamModal.vue';
import EditableTitle from '../../components/mixtapes/EditableTitle.vue';
import PublishButton from '../../components/mixtapes/PublishButton.vue';
import Panel from '../../components/Panel.vue';
import ShareLandingBanner from '../../components/ShareLandingBanner.vue';
import PagePlaceholder from '../../components/PagePlaceholder.vue';
import PageHeader from '~/components/PageHeader.vue';
import getMixtapeArt from '../../util/getMixtapeArt';
import { showModal } from '~/util/modal';

export default {
  components: {
    Mixtape,
    MainWrapper,
    PostJamButton,
    NewJamModal,
    EditableTitle,
    PublishButton,
    Panel,
    ShareLandingBanner,
    PagePlaceholder,
    PageHeader,
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
    const { mixtape, author } = await this.$accessor.mixtapes.loadMixtape(
      mixtapeId
    );
    // this is also done when navigating in - see <mixtape-item>
    this.$accessor.colorScheme.setOverrideFromProfile(author.name);

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
      return this.$accessor.mixtapes.getMixtape(this.mixtapeId);
    },

    isOwnMixtape() {
      return this.mixtape.author.name === this.$accessor.currentUser.user?.name;
    },

    isEditing() {
      return (
        this.mixtape.author.id === this.$accessor.currentUser.user?.id &&
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
      showModal(this.$router, this.$route, 'new-jam');
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
        await this.$accessor.mixtapes.deleteMixtape({
          mixtapeId,
        });
      } catch (err) {
        this.$accessor.showErrorModal();
        throw err;
      }

      this.$router.push('/', () => {
        this.$accessor.mixtapes.removeMixtapeFromCache({ mixtapeId });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.mixtape-meta {
  font-size: $text-md;

  @media (max-width: $breakpoint-small) {
    font-size: $text-base;
  }
}

.link-button {
  text-decoration: underline;
  padding: 0;

  &:hover {
    text-decoration: none;
  }
}
</style>
