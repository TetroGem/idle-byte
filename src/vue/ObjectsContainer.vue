<script setup lang="ts">
import { registerComponent } from '@/ts/component-registry';
import { getCurrentInstance, type PropType } from 'vue';

registerComponent(getCurrentInstance());
defineProps({
    header: {
        type: String as PropType<string>,
        required: true,
    },
    info: {
        type: String as PropType<string>,
        required: false,
    },
});
</script>

<template>
    <div class="outer-container">
        <div class="cheader">{{ header }}</div>
        <div class="ctext" v-if="info">{{ info }}</div>
        <div class="inner-container">
            <slot></slot>
        </div>
    </div>
</template>

<style>
.outer-container {
    width: 900px;
    border: 1px solid black;
    padding: 2%;
}

.ctext {
    padding-bottom: 0.5%;
}

.cheader {
    font-weight: bold;
}

.inner-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 2%;
    column-gap: 2%;
}
</style>