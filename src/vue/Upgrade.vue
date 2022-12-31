<script setup lang="ts">
import { registerComponent } from '@/ts/component-registry';
import { player } from '@/ts/player';
import type { Purchase } from '@/ts/purchase';
import { getCurrentInstance, type PropType } from 'vue';
import { formatBits } from '@/ts/format';

registerComponent(getCurrentInstance());
defineProps({
    upgrade: {
        type: Object as PropType<Purchase>,
        required: true,
    },
});
</script>

<template>
    <div
        class="upgrade"
        @click="player.buyPurchase(upgrade)"
        :style="{ backgroundColor: player.canAfford(upgrade.cost) ? 'yellow' : 'white' }"
    >
        <span>{{ upgrade.name }}</span><br>
        <span>Cost: {{ formatBits(upgrade.cost) }}</span><br>
    </div>
</template>