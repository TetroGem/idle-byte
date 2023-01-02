import { createApp } from 'vue';

import App from '../vue/App.vue';
import { db } from './db';
import { update } from './loop';
import { player } from './player';
import { forceUpdateAll } from './component-registry';

import '../css/styles.css';

const app = createApp(App);

async function main() {
    await db.open();
    const res = await db.save.limit(1).first();
    console.log(res);
    if(res !== undefined) {
        try {
            player.saveData = res.data;
        } catch {
            alert("Failed to load save data. Resetting save data.")
        }
    }

    setInterval(() => {
        update();
        forceUpdateAll();
    }, 20);

    app.mount('#app');
}

main();