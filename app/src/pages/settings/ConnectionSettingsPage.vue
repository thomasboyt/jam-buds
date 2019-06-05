<template>
  <div>
    <h3>connect to streaming services</h3>

    <connect-streaming-section />

    <h3>connect to twitter</h3>

    <connect-twitter-section />
  </div>
</template>

<script>
import ConnectStreamingSection from '../../components/settings/ConnectStreamingSection.vue';
import ConnectTwitterSection from '../../components/settings/ConnectTwitterSection.vue';

export default {
  components: { ConnectStreamingSection, ConnectTwitterSection },
};
</script>
