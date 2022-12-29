<script setup lang="ts">
import type { Disk } from '@/ts/disk';
import { getCurrentInstance, type PropType } from 'vue';
import Upgrade from './Upgrade.vue';
import { registerComponent } from '@/ts/component-registry';

registerComponent(getCurrentInstance());

defineProps({
    disk: {
        type: Object as PropType<Disk>,
        required: true,
    }
});
</script>

<template>
    <div class="panel" v-if="disk">
        <span class="header">{{ disk.name }}</span><br>
        <span class="binary-value">{{ disk.binaryBits }}</span><br>
        <span class="decimal-value">({{ disk.storage }})</span><br><br>
        <div class="upgrades-panel">
            <div class="upgrades-header">Upgrades</div>
            <Upgrade :upgrade="disk.storageUpgrade"></Upgrade>
        </div>
    </div>
</template>

<style src="../css/info-panel.css">
    
</style>