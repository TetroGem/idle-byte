<script setup lang="ts">
import { getCurrentInstance, type PropType } from 'vue';
import Upgrade from './Upgrade.vue';
import { registerComponent } from '@/ts/component-registry';
import type { Cloud } from '@/ts/cloud';
import { formatBinary } from '@/ts/format';

registerComponent(getCurrentInstance());

defineProps({
    cloud: {
        type: Object as PropType<Cloud>,
        required: true,
    }
});
</script>

<template>
    <div class="panel" v-if="cloud">
        <span class="header">Cloud</span><br>
        <!-- <span class="binary-value">{{ formatBinary(cloud.bits) }}</span><br> -->
        <span class="decimal-value">({{ cloud.bits }})</span><br><br>
        <div class="upgrades-panel">
            <div class="upgrades-header">Upgrades</div>
            <Upgrade :upgrade="cloud.uploadSpeedPurchase"></Upgrade>
        </div>
    </div>
</template>

<style src="../css/info-panel.css">
    
</style>