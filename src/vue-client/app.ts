import Vue from 'vue';

const HelloWorld = Vue.component('hello-world', {
  template: `<button v-on:click="greet">Say hello!</button>`,

  data: () => ({
    message: 'Hello!',
  }),

  methods: {
    greet() {
      alert(this.message);
    },
  }
});

const app = new Vue({
  template: `
    <div>
      <p>Hi!</p>
      <hello-world></hello-world>
    </div>
  `
});

export default app;