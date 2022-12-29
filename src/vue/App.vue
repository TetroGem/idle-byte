<script setup lang="ts">
import { player} from '@/ts/player';
import InfoPanel from './InfoPanel.vue';
import { getCurrentInstance } from 'vue';
import { registerComponent } from '@/ts/component-registry';

registerComponent(getCurrentInstance());
</script>

<template>
    <div class="bit-counter">
        You have {{ player.bits }}b / {{ player.maxStorage }}b
    </div>
    <div class="containers-container">
        <div class="objects-container">
            <div class="several-container">
                <div class="disk" v-for="disk in player.disks" @click="player.interactWithDisk(disk)">
                    <span class="disk-header">{{ disk.name }}</span><br><br>
                    <span class="disk-value">{{ disk.binaryBits }}</span>
                </div>
                <div class="disk disk-buy" @click="player.buyPurchase(player.nextDiskPurchase)">
                    <span class="disk-header">Buy 4b Disk</span><br><br>
                    <span class="disk-info">Cost: {{ player.nextDiskPurchase.cost }}b</span>
                </div>
            </div>
            <div class="several-container" v-if="player.bits >= 60">
                <div class="disk" v-for="chip in player.chips" @click="player.interactWithChip(chip)">
                    <span class="disk-header">{{ chip.name }}</span><br><br>
                    <!-- <span class="disk-value">{{ disk.getBinaryValue() }}</span> -->
                </div>
                <div class="disk disk-buy" @click="player.buyPurchase(player.nextChipPurchase)">
                    <span class="disk-header">{{ player.nextChipPurchase.name }}</span><br><br>
                    <span class="disk-info">Cost: {{ player.nextChipPurchase.cost }}b</span>
                </div>
            </div>
        </div>
        <InfoPanel :selection="player.selection"></InfoPanel>
    </div>
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

.several-container {
    width: 900px;
    display: flex;
    border: 1px solid black;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 2%;
    padding: 2%;
    column-gap: 2%;
}

.disk {
    border: 3px solid black;
    width: 10%;
    height: 0;
    padding-bottom: 10%;
    text-align: center;
    margin-bottom: 2%;
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