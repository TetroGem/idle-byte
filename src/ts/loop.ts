import { player } from './player';
import { update as debugInfoUpdate } from '../vue/DebugInfo';

export let tick = 0;

export function update() {
    player.update();
    debugInfoUpdate();

    tick++;
}