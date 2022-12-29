<script setup lang="ts">
import { Chip } from '@/ts/chip';
import { Disk } from '@/ts/disk';
import { getCurrentInstance, type PropType } from 'vue';
import DiskInfoPanel from './DiskInfoPanel.vue';
import ChipInfoPanel from './ChipInfoPanel.vue';
import { registerComponent } from '@/ts/component-registry';

registerComponent(getCurrentInstance());
defineProps({
    selection: {
        type: Object as PropType<Disk | Chip | null>,
        required: true,
    }
});
</script>

<template>
    <DiskInfoPanel v-if="(selection instanceof Disk)" :disk="selection"></DiskInfoPanel>
    <ChipInfoPanel v-if="(selection instanceof Chip)" :chip="selection"></ChipInfoPanel>
</template>