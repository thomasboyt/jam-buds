<template>
  <div>
    <panel title="connect to streaming services">
      <connect-streaming-section />
    </panel>

    <panel title="connect to twitter">
      <connect-twitter-section />
    </panel>
  </div>
</template>

<script>
import ConnectStreamingSection from '../../components/settings/ConnectStreamingSection.vue';
import ConnectTwitterSection from '../../components/settings/ConnectTwitterSection.vue';
import Panel from '../../components/Panel.vue';

export default {
  components: { Panel, ConnectStreamingSection, ConnectTwitterSection },
};
</script>
