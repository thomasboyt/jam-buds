<template>
  <form @submit="handleSubmit">
    <input type="email" v-model="email" placeholder="enter email...">
    
    <button type="submit">get started</button>
  </form>
</template>

<script>
import axios from 'axios';

import apiRequest from '../apiRequest';

export default {
  data() {
    return {
      email: '',
    };
  },

  methods: {
    async handleSubmit(evt) {
      evt.preventDefault();

      const email = this.email;

      const resp = await axios.post(
        `${process.env.API_URL}/auth/sign-in-token`,
        {
          email,
        }
      );

      if (resp.status === 200) {
        console.log('token generated, check log');
      }
    },
  },
};
</script>
