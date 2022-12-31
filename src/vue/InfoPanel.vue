<script setup lang="ts">
import { Chip } from '@/ts/chip';
import { Disk } from '@/ts/disk';
import { getCurrentInstance, type PropType } from 'vue';
import DiskInfoPanel from './DiskInfoPanel.vue';
import ChipInfoPanel from './ChipInfoPanel.vue';
import { registerComponent } from '@/ts/component-registry';
import type { PlayerSelection } from '@/ts/player';
import { Cloud } from '@/ts/cloud';
import CloudInfoPanel from './CloudInfoPanel.vue';

registerComponent(getCurrentInstance());
defineProps({
    selection: {
        type: Object as PropType<PlayerSelection>,
        required: true,
    }
});
</script>

<template>
    <DiskInfoPanel v-if="(selection instanceof Disk)" :disk="selection"></DiskInfoPanel>
    <ChipInfoPanel v-if="(selection instanceof Chip)" :chip="selection"></ChipInfoPanel>
    <CloudInfoPanel v-if="(selection instanceof Cloud)" :cloud="selection"></CloudInfoPanel>
</template>