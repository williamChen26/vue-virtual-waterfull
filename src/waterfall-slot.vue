<template>
    <div ref="waterfallItem" class="vue-waterfall-slot" :class="moveClass" v-show="isRender">
        <template v-if="isRender">
            <slot></slot>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick } from 'vue';
// import { calculate, RESET_REACTS } from './calculate';
import { renderManager, RESET_REACTS } from './render-manager';

// type EleForm = InstanceType<typeof ElForm>

const props = {
    width: {
        type: [String, Number],
        required: true,
        validator: (val: number): boolean => val >= 0,
    },
    height: {
        type: [String, Number],
        required: true,
        validator: (val: number): boolean => val >= 0,
    },
    order: {
        type: [String, Number],
        default: 0,
    },
    moveClass: {
        type: String,
        default: '',
    },
};

const COMPONENT_NAME = 'waterfall-slot';

const Component = defineComponent({
    name: COMPONENT_NAME,
    props,
    setup(props) {
        // const setRect: any = publicInstance.updateRects();
        // const { register } = renderManager.controller();
        const index = ref(0);
        let targetLocation: any;
        // const count = inject<Ref<number>>(countSymbol) as Ref<number>;
        const waterfallItem = ref<HTMLElement | null>(null);
        const notify = () => {
            renderManager.register(getMeta());
            index.value = renderManager.countRectsLen() - 1;
        };

        const isRender = ref<undefined | boolean>(false);
        // watch(
        //     () => [props.width, props.height],
        //     () => {
        //         update(index.value, getMeta());
        //     },
        // );

        const getMeta = () => {
            return {
                isRender: isRender.value,
                order: props.order,
                width: props.width,
                height: props.height,
                moveClass: props.moveClass,
            };
        };
        const resetPosition = () => {
            nextTick(() => {
                if (!waterfallItem.value) return;
                const meta = renderManager.getMetadata(index.value);
                const { top, left, width, height } = meta;
                targetLocation = meta.targetLocation;
                (waterfallItem.value as HTMLElement).style.top = top + 'px';
                (waterfallItem.value as HTMLElement).style.left = left + 'px';
                (waterfallItem.value as HTMLElement).style.width = width + 'px';
                (waterfallItem.value as HTMLElement).style.height = height + 'px';
                isRender.value = true;
            });
        };
        onMounted(() => {
            notify();
            // ~
            resetPosition();
            renderManager.on(RESET_REACTS, resetPosition);
        });
        onUnmounted(() => {
            if (!renderManager.readyReset) {
                renderManager.$startingstate = targetLocation;
            }
            renderManager.off(RESET_REACTS, resetPosition);
            if (renderManager.timer) {
                clearTimeout(renderManager.timer);
            }
            renderManager.timer = setTimeout(() => {
                renderManager.readyReset = false;
            });
        });
        return {
            waterfallItem,
            isRender,
            index,
        };
    },
});

export default Component;
</script>
<style lang="less">
@import './index.less';
</style>
