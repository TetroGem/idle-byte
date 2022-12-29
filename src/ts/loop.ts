import { player } from './player';

export let tick = 0;

export function update() {
    player.update();

    tick++;
}