<script setup lang="ts">
import { getCurrentInstance, type PropType } from 'vue';
import Upgrade from './Upgrade.vue';
import type { Chip } from '@/ts/chip';
import { player } from '@/ts/player';
import { registerComponent } from '@/ts/component-registry';
import Overclockable from './Overclockable.vue';

registerComponent(getCurrentInstance());

defineProps({
    chip: {
        type: Object as PropType<Chip>,
        required: true,
    }
});
</script>

<template>
    <div class="panel" v-if="chip">
        <span class="header">{{ chip.name }}</span><br>
        Target Disk:
        <select
            v-model="chip.targetDisk"
            :style="{ backgroundColor: chip.targetDisk === null ? 'yellow' : 'white' }"
        >
            <option :value="null">None</option>
            <option v-for="disk in player.disks" :value="disk">{{ disk.name }}</option>
        </select>
        <br />
        <br />
        <span v-if="chip.overclock > 0">
            <Overclockable :chip="chip" style="height: 2%;">
                <div class="overclock" @click="chip.activateOverclock()">
                    <br />
                    Overclock {{ chip.overclock }}
                    <br />
                    <br />
                </div>
            </Overclockable>
            <br />
        </span>
        <div class="upgrades-panel">
            <div class="upgrades-header">Upgrades</div>
            <Upgrade :upgrade="chip.clockSpeedPurchase"></Upgrade>
            <Upgrade :upgrade="chip.overclockPurchase"></Upgrade>
        </div>
    </div>
</template>

<style>
.panel {
    outline: 1px solid black;
    float: right;
    width: 20%;
    text-align: center;
    padding-bottom: 20%;
    position: top;
    padding: 2%;
}

.header {
    font-size: xx-large;
    font-weight: bolder;
}

.binary-value {
    font-family: monospace;
    font-size: large;
}

.decimal-value {
    font-family: monospace;
    font-size: large;
}

.upgrades-panel {
    outline: 1px solid black;
    display: flex;
    gap: 10%;
    row-gap: 10%;
    column-gap: 10%;
    flex-direction: column;
    padding: 2%;
    flex-wrap: column;
}

.upgrades-header {
    text-align: left;
    font-weight: bold;
}

.upgrade {
    outline: 1px solid black;
    text-align: center;
}

.overclock {
    outline: 1px solid black;
    text-align: center;
}
</style>