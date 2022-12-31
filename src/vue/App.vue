<script setup lang="ts">
import { player } from '@/ts/player';
import InfoPanel from './InfoPanel.vue';
import { getCurrentInstance } from 'vue';
import { registerComponent } from '@/ts/component-registry';
import ObjectsContainer from './ObjectsContainer.vue';
import DebugInfo from './DebugInfo.vue';
import { formatBinary, formatBits, formatTime } from '@/ts/format';
import { estimateSecondsUntil } from '@/ts/estimate';

registerComponent(getCurrentInstance());
</script>

<template>
    <div class="bit-counter">
        You have {{ formatBits(player.bits) }}
    </div>
    <div class="containers-container">
        <div class="objects-containers">
            <ObjectsContainer
                :header="'Cloud'"
                :info="player.cloud === null ? undefined : `Used ${formatBits(player.bitsOnCloud)}, Uploading at ${formatBits(player.cloud.uploadSpeed)}/s`"
                v-if="player.stats.cloudUnlocked"
            >
                <div
                    class="cloud"
                    @click="player.buyPurchase(player.cloudPurchase)"
                    v-if="player.cloud === null"
                    :style="{ backgroundColor: player.canAfford(player.cloudPurchase.cost) ? 'yellow' : 'white' }"
                >
                    <span class="disk-header">{{ player.cloudPurchase.name }}</span><br />
                    <span>Cost: {{ formatBits(player.cloudPurchase.cost) }}</span>
                </div>
                <div
                    class="cloud"
                    @click="player.interactWithCloud()"
                    v-if="player.cloud !== null"
                    :style="{ backgroundColor: player.canAfford(player.cloud.uploadSpeedPurchase.cost) ? 'yellow' : 'white' }"
                >
                    Upload to Cloud
                </div>
            </ObjectsContainer>
            <br />
            <ObjectsContainer :header="'Disks'" :info="`Used ${formatBits(player.bitsOnDisks)} / ${formatBits(player.maxStorage)}, Full in ${formatTime(estimateSecondsUntil(player.bitsOnDisks, player.maxStorage, player.stats.bitsPerSecond))}`">
                <div
                    class="disk"
                    v-for="disk in player.disks"
                    @click="player.interactWithDisk(disk)"
                    :style="{ backgroundColor: player.canAfford(disk.capacityPurchase.cost) ? 'yellow' : 'white' }"
                >
                    <span class="disk-header">{{ disk.name }}</span><br><br>
                    <span
                        class="disk-value"
                        :style="{ fontSize: '1.25em' }"
                    >
                        {{ formatBits(disk.bits) }}
                    </span>
                </div>
                <div
                    class="disk disk-buy"
                    @click="player.buyPurchase(player.nextDiskPurchase)"
                    :style="{ backgroundColor: player.canAfford(player.nextDiskPurchase.cost) ? 'yellow' : 'white' }"
                >
                    <span class="disk-header">{{ player.nextDiskPurchase.name }}</span><br><br>
                    <span class="disk-info">Cost: {{ formatBits(player.nextDiskPurchase.cost) }}</span>
                </div>
            </ObjectsContainer>
            <br />
            <ObjectsContainer
                :header="'Chips'"
                :info="player.chips.length === 0 ? undefined : `Computing ${formatBits(player.stats.bitsPerSecond)}/s`"
                v-if="player.stats.chipsUnlocked"
            >
                <div
                    class="disk"
                    v-for="chip in player.chips"
                    @click="player.interactWithChip(chip)"
                    :style="{ backgroundColor:
                        chip.targetDisk === null ? 'grey'
                        : chip.bitsPerSecond === 0 ? 'red'
                        : player.canAfford(chip.clockSpeedPurchase.cost) || player.canAfford(chip.overclockPurchase.cost) ? 'yellow'
                        : 'white'
                    }"
                >
                    <span class="disk-header">{{ chip.name }}</span><br><br>
                    <span class="disk-info">
                        {{ chip.targetDisk === null ? '(Disabled)' : `(${chip.targetDisk.diskLetter}:)` }}
                    </span>
                    <!-- <span class="disk-value">{{ disk.getBinaryValue() }}</span> -->
                </div>
                <div
                    class="disk disk-buy"
                    @click="player.buyPurchase(player.nextChipPurchase)"
                    :style="{ backgroundColor: player.canAfford(player.nextChipPurchase.cost) ? 'yellow' : 'white' }"
                >
                    <span class="disk-header">{{ player.nextChipPurchase.name }}</span><br><br>
                    <span class="disk-info">Cost: {{ formatBits(player.nextChipPurchase.cost) }}</span>
                </div>
            </ObjectsContainer>
        </div>
        <InfoPanel :selection="player.selection" />
    </div>
    <DebugInfo />
</template>

<style>
html {
    user-select: none;
}

.bit-counter {
    display: flex;
    justify-content: space-between;
    text-align: center;
    font-size: xx-large;
    font-weight: bold;
    margin-bottom: 10px;
}

.disk {
    border: 3px solid black;
    width: 10%;
    height: 0;
    padding-bottom: 10%;
    text-align: center;
}

.disk-header {
    font-weight: bold;
}

.disk-value {
    font-family: monospace;
    font-size: large;
}

.cloud {
    border: 3px solid black;
    width: 20%;
    text-align: center;
}

.containers-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
</style>