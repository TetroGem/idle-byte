<script setup lang="ts">
import { player } from '@/ts/player';
import InfoPanel from './InfoPanel.vue';
import { getCurrentInstance } from 'vue';
import { registerComponent } from '@/ts/component-registry';
import ObjectsContainer from './ObjectsContainer.vue';
import DebugInfoComponent from './DebugInfoComponent.vue';
import { formatBinary, formatBits, formatTime } from '@/ts/format';
import { estimateSecondsUntil } from '@/ts/estimate';
import ProgressBarBelow from './ProgressBarBelow.vue';
import Overclockable from './Overclockable.vue';
import ChipComponent from './ChipComponent.vue';

registerComponent(getCurrentInstance());
</script>

<template>
    <div class="bit-counter">
        You have {{ formatBits(player.bits) }}
    </div>
    <div class="containers-container">
        <div class="objects-containers">
            <ObjectsContainer
                :header="'Internet'"
                v-if="player.stats.internetUnlocked"
            >
                <ObjectsContainer
                    :header="'Cloud'"
                    :info="player.cloud === null ? undefined : `Used ${formatBits(player.bitsOnCloud)}, Uploading at ${formatBits(player.cloud.uploadSpeed)}/s`"
                    v-if="player.stats.cloudUnlocked"
                >
                    <div
                        class="cloud cloud-progress"
                        @click="player.buyPurchase(player.cloudPurchase)"
                        v-if="player.cloud === null"
                        :style="{ backgroundColor: player.canAfford(player.cloudPurchase.cost) ? 'yellow' : 'white' }"
                    >
                        <span class="disk-header">{{ player.cloudPurchase.name }}</span><br />
                        <span>Cost: {{ formatBits(player.cloudPurchase.cost) }}</span>
                    </div>
                    <ProgressBarBelow
                        class="cloud-progress"
                        v-if="player.cloud !== null"
                        :progress="player.cloud.uploadProgress"
                    >
                        <div
                            class="cloud"
                            @click="player.interactWithCloud()"
                            :style="{ backgroundColor: player.canAfford(player.cloud.uploadSpeedPurchase.cost) ? 'yellow' : 'white' }"
                        >
                            Upload to Cloud
                        </div>
                    </ProgressBarBelow>
                </ObjectsContainer>
            </ObjectsContainer>
            <br />
            <ObjectsContainer :header="'Disks'" :info="`Used ${formatBits(player.bitsOnDisks)} / ${formatBits(player.maxStorage)}, Full in ${formatTime(estimateSecondsUntil(player.bitsOnDisks, player.maxStorage, player.stats.bitsPerSecond))}`">
                <div
                    class="disk disk-size"
                    v-for="disk in player.disks"
                    @click="player.interactWithDisk(disk)"
                    :style="{ backgroundColor: player.canAfford(disk.capacityPurchase.cost) ? 'yellow' : 'white' }"
                >
                    <span class="disk-header">{{ disk.nameWithoutLetter }}</span>
                    <br />
                    <span class="disk-header">({{ disk.diskLetter }}:)</span>
                    <br />
                    <br />
                    <span
                        class="disk-value"
                    >
                        {{ formatBits(disk.bits) }}
                    </span>
                </div>
                <div
                    class="disk disk-buy disk-size"
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
                <ChipComponent v-for="chip in player.chips" class="disk-size" :chip="chip"/>
                <div
                    class="disk disk-buy disk-size"
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
    <DebugInfoComponent />
</template>
<!-- 
<style src="@/css/styles.css" /> -->

<style scoped>
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
    text-align: center;
}

.disk-size {
    width: 10%;
    height: 0;
    padding-bottom: 10%;
}

.disk-header {
    font-weight: bold;
    font-size: 14px;
}

.disk-value {
    font-family: monospace;
    font-size: 14px;
}

.cloud-progress {
    width: 20%;
    text-align: center;
}

.cloud {
    border: 3px solid black;
}

.containers-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
</style>