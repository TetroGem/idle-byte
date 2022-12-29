<script setup lang="ts">
import { player } from '@/ts/player';
import InfoPanel from './InfoPanel.vue';
import { getCurrentInstance } from 'vue';
import { registerComponent } from '@/ts/component-registry';
import ObjectsContainer from './ObjectsContainer.vue';
import DebugInfo from './DebugInfo.vue';

registerComponent(getCurrentInstance());
</script>

<template>
    <div class="bit-counter">
        You have {{ player.bits }}b
    </div>
    <div class="containers-container">
        <div class="objects-containers">
            <ObjectsContainer :header="'Disks'" :info="`Used ${player.bits}b / ${player.maxStorage}b`">
                <div class="disk" v-for="disk in player.disks" @click="player.interactWithDisk(disk)">
                    <span class="disk-header">{{ disk.name }}</span><br><br>
                    <span class="disk-value">{{ disk.binaryBits }}</span>
                </div>
                <div class="disk disk-buy" @click="player.buyPurchase(player.nextDiskPurchase)">
                    <span class="disk-header">Buy 4b Disk</span><br><br>
                    <span class="disk-info">Cost: {{ player.nextDiskPurchase.cost }}b</span>
                </div>
            </ObjectsContainer>
            <br>
            <ObjectsContainer
                :header="'Chips'"
                :info="`Computing ${player.stats.bitsPerSecond}b/s`"
                v-if="player.stats.chipsUnlocked"
            >
                <div class="disk" v-for="chip in player.chips" @click="player.interactWithChip(chip)">
                    <span class="disk-header">{{ chip.name }}</span><br><br>
                    <!-- <span class="disk-value">{{ disk.getBinaryValue() }}</span> -->
                </div>
                <div class="disk disk-buy" @click="player.buyPurchase(player.nextChipPurchase)">
                    <span class="disk-header">{{ player.nextChipPurchase.name }}</span><br><br>
                    <span class="disk-info">Cost: {{ player.nextChipPurchase.cost }}b</span>
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

.containers-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
</style>