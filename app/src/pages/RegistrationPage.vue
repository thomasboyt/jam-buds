<template>
  <sidebar-wrapper>
    <main-wrapper>
      <h2>get started</h2>

      <p>slam a name down and get started! you can change it later, don't stress.</p>

      <form @submit="handleSubmit">
        <input type="text" v-model="name">
        
        <button type="submit">gogogo</button>
      </form>
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import axios from 'axios';

import apiRequest from '../apiRequest';

import SidebarWrapper from '../components/SidebarWrapper.vue';
import MainWrapper from '../components/MainWrapper.vue';
import titleMixin from '../util/titleMixin';

export default {
  components: { SidebarWrapper, MainWrapper },

  mixins: [titleMixin],

  title: 'Register',

  data() {
    return {
      name: '',
    };
  },

  created() {
    if (this.$store.state.auth.authenticated) {
      this.$router.push('/');
    }
  },

  methods: {
    async handleSubmit(evt) {
      evt.preventDefault();

      const name = this.name;

      const resp = await axios.post('/auth/registration', {
        name,
        token: this.$route.query.t,
      });

      if (resp.status === 200) {
        document.location = '/';
      }
    },
  },
};
</script>
