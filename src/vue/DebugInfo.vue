<script setup lang="ts">
import { registerComponent } from '@/ts/component-registry';
import { getCurrentInstance, toRefs, type PropType, computed, ref } from 'vue';
import debugInfo from '@/vue/DebugInfo';
import { player } from '@/ts/player';

registerComponent(getCurrentInstance());
</script>

<template>
    <div class="info">
        <div>b0.0.0</div>
        <div>TetroGem 2022</div>
    </div>
    <div class="info right-side">
        <div class="saved" :style="{ opacity: debugInfo.savedOpacity }">Saved!</div>
        <button @click="player.save()">Save</button>
        <button @click="debugInfo.exportSaveData()">Export</button>
        <button @click="debugInfo.importSaveData()">Import</button>
    </div>
</template>

<style>
.info {
    position: fixed;
    width: 50%;
    bottom: 0;
    padding: 0.25%;
    margin: 0;
    padding-bottom: 0.75%;
}

.right-side {
    right: 0;
    text-align: right;
    padding-right: 0.75%
}
</style>