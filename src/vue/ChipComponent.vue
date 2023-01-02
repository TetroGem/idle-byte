<script setup lang="ts">
import type { Chip } from '@/ts/chip';
import { registerComponent } from '@/ts/component-registry';
import { player } from '@/ts/player';
import { getCurrentInstance, type PropType } from 'vue';
import Overclockable from './Overclockable.vue';

registerComponent(getCurrentInstance());

defineProps({
    chip: {
        type: Object as PropType<Chip>,
        required: true,
    }
})
</script>

<template>
    <Overclockable :chip="chip" :enabled="chip.overclock > 0">
        <div
            class="disk disk-size"
            @click="player.interactWithChip(chip)"
            :style="{ backgroundColor:
                chip.targetDisk === null ? 'grey'
                : chip.bitsPerSecond === 0 ? 'red'
                : player.canAfford(chip.clockSpeedPurchase.cost) || player.canAfford(chip.overclockPurchase.cost) ? 'yellow'
                : 'white'
            }"
        >
            <span class="disk-header">{{ chip.name }}</span><br><br>
            <span class="disk-value">
                {{ chip.targetDisk === null ? '(Disabled)' : `(${chip.targetDisk.diskLetter}:)` }}
            </span>
            <!-- <span class="disk-value">{{ disk.getBinaryValue() }}</span> -->
        </div>
    </Overclockable>
</template>

<style scoped>
.disk {
    border: 3px solid black;
    text-align: center;
}

.disk-size {
    width: 90px;
    height: 0;
    padding-bottom: 90px;
}

.disk-header {
    font-weight: bold;
    font-size: 14px;
}

.disk-value {
    font-family: monospace;
    font-size: large;
}
</style>