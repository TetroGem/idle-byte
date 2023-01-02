<script setup lang="ts">
import { registerComponent } from '@/ts/component-registry';
import { getCurrentInstance, type PropType } from 'vue';

registerComponent(getCurrentInstance());

defineProps({
    progress: {
        type: Number as PropType<number>,
        required: true,
    },
    color: {
        type: String as PropType<string>,
        required: false,
        default: '#00aa00',
    }
})
</script>

<template>
    <div class="container">
        <slot />
        <div class="progress-bar">
            <div :style="{ backgroundColor: color, width: `${progress * 100}%`, height: '100%' }" />
        </div>
    </div>
</template>

<style scoped>
    .container {
        display: inline;
        width: fit-content;
    }

    .progress-bar {
        width: 100%;
        height: 10px;
        background-color: #ddd;
    }
</style>
