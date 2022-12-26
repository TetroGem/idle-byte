<template>
    <div class="bit-counter"></div>
    <div class="drives-container">
        <div class="drive drive-4bit" v-for="disk in player.disks">
            Storage: {{ disk.storage }}b - Upgrade Cost: {{ disk.cost }}b
        </div>
    </div>
</template>

<script lang="ts">
import { player } from '@/ts/player';

export default {
    data: () => ({
        player: player,
    }),
    methods: {

    },
};
</script>