<template>
  <settings-panel-expanding
    title="Notifications"
    path="/settings/notifications"
  >
    change if and how we ping you for various updates
    <template #expanded>
      <notifications />
    </template>
  </settings-panel-expanding>
</template>

<script>
import SettingsPanelExpanding from './SettingsPanelExpanding.vue';
import Notifications from './Notifications.vue';

export default {
  components: { SettingsPanelExpanding, Notifications },
};
</script>