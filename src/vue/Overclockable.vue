<script setup lang="ts">
import { registerComponent } from '@/ts/component-registry';
import { getCurrentInstance, type PropType } from 'vue';
import type { Chip } from '@/ts/chip';
import ProgressBarBelow from './ProgressBarBelow.vue';

registerComponent(getCurrentInstance());
defineProps({
    chip: {
        type: Object as PropType<Chip>,
        required: true,
    },
    enabled: {
        type: Boolean as PropType<boolean>,
        required: false,
        default: true,
    }
});
</script>

<template>
    <div class="container">
        <span v-if="enabled">
            <ProgressBarBelow :progress="chip.overclockProgress">
                <ProgressBarBelow :progress="chip.overclockCooldownProgress" :color="'#cc1199'">
                    <slot />
                </ProgressBarBelow>
            </ProgressBarBelow>
        </span>
        <span v-else>
            <slot />
        </span>
    </div>
</template>

<style scoped>
.container {
    width: fit-content;
    display: inline;
}
</style>