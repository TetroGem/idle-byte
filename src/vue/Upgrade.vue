<script setup lang="ts">
import { registerComponent } from '@/ts/component-registry';
import { player } from '@/ts/player';
import type { Purchase } from '@/ts/purchase';
import { getCurrentInstance, type PropType } from 'vue';

registerComponent(getCurrentInstance());
defineProps({
    upgrade: {
        type: Object as PropType<Purchase>,
        required: true,
    },
});
</script>

<template :key="performance.now()">
    <div class="upgrade" @click="player.buyPurchase(upgrade)">
        <span>{{ upgrade.name }}</span><br>
        <span>Cost: {{ upgrade.cost }}b</span><br>
    </div>
</template>