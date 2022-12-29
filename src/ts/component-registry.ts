import type { ComponentInternalInstance } from "vue";

const components: ComponentInternalInstance[] = [];

export function registerComponent(component: ComponentInternalInstance | null) {
    if(component === null) return;
    components.push(component);
}

export function forceUpdateAll() {
    for(const component of components) {
        component.proxy?.$forceUpdate();
    }
}