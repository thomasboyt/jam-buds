<template>
  <div>
    <panel title="newsletter settings">
      <newsletter-subscription />
    </panel>
  </div>
</template>

<script>
import Panel from '../../components/Panel.vue';
import NewsletterSubscription from '../../components/settings/NewsletterSubscription.vue';

export default {
  components: { Panel, NewsletterSubscription },
};
</script>
