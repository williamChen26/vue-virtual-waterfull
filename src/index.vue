<template>
    <div ref="waterfallDom" class="vue-waterfall" :style="innerStyle">
        <template v-if="data.length">
            <div
                v-for="(item, index) in displayItems"
                class="vue-virtual-collection-container"
                :style="getComputedStyle(item)"
                :key="index"
            >
                <slot :item="item"></slot>
            </div>
        </template>
        <template v-else>
            <slot />
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { on, off } from './utils/utils';
import { calculate } from './calculate';
import { renderManager, REGISTER_REACTS } from './render-manager';
import GeneralManager from './general-manager';

const props = {
    autoResize: {
        type: Boolean,
        default: true,
    },
    interval: {
        type: Number,
        default: 200,
        validator: (val: number): boolean => val >= 0,
    },
    align: {
        type: String,
        default: 'left',
        validator: (val: string): boolean => !!~['left', 'right', 'center'].indexOf(val),
    },
    margin: {
        type: Number,
        default: 0,
    },
    lineGap: {
        type: Number,
        required: true,
        validator: (val: number): boolean => val >= 0,
    },
    minLineGap: {
        type: Number,
        validator: (val: number): boolean => val >= 0,
    },
    maxLineGap: {
        type: Number,
        validator: (val: number): boolean => val >= 0,
    },
    singleMaxWidth: {
        type: Number,
        validator: (val: number): boolean => val >= 0,
    },
    fixedHeight: {
        type: Boolean,
        default: false,
    },
    data: {
        type: Array,
        default: () => [],
    },
    preRender: {
        type: Number,
        default: 600,
    },
    container: {
        type: [HTMLElement, String],
        default: 'body',
    },
    headerHeight: {
        type: Number,
        default: 0,
    },
    visibleHeight: {
        type: Number,
        default: 1000,
    },
};

// const MOVE_CLASS_PROP = '_wfMoveClass';

const COMPONENT_NAME = 'waterfall';

const Component = defineComponent({
    name: COMPONENT_NAME,
    props,
    emits: ['reflowed'],
    setup(props, { emit }) {
        const innerStyle = ref({
            height: '',
            overflow: '',
        });
        const waterfallDom = ref<HTMLElement | null>(null);
        const maxLineGap = props.maxLineGap ? +props.maxLineGap : (props.lineGap as number);
        const token = ref<ReturnType<typeof setTimeout> | null>(null);

        /**
         * virtual list;
         */
        const displayItems = ref<any>([]);
        let virtualListManagers: any = null;
        let container: any = null;
        if (typeof props.container === 'string') {
            container = document.querySelector(props.container);
        } else {
            container =
                (props.container && props.container.scrollTop) ||
                (waterfallDom.value as HTMLElement).scrollTop;
        }

        const initContext = () => {
            calculate.contextOptions = {
                clientWidth: (waterfallDom.value as HTMLElement).clientWidth,
                interval: props.interval,
                align: ~['left', 'right', 'center'].indexOf(props.align) ? props.align : 'left',
                margin: props.margin,
                lineGap: props.lineGap ? +props.lineGap : 0,
                minLineGap: props.minLineGap ? +props.minLineGap : props.lineGap,
                maxLineGap: maxLineGap,
                singleMaxWidth: Math.max(props.singleMaxWidth || 0, maxLineGap),
                fixedHeight: !!props.fixedHeight,
            };
        };
        let renderer = () => {};
        // 获取渲染函数
        const controlRenderer = (data: any) => {
            const virtualListRender = () => {
                if (!virtualListManagers) {
                    virtualListManagers = new GeneralManager({
                        data,
                        preRangeRender: props.preRender,
                        calculate,
                    });
                } else {
                    virtualListManagers.updateGroup(data);
                }

                flushDisplayItems();
            };
            const normalRender = () => {};
            if (data.length) {
                (container as HTMLElement).onscroll = flushDisplayItems;
                virtualListRender();
                return virtualListRender;
            } else {
                renderManager.on(REGISTER_REACTS, (height) => {
                    innerStyle.value = {
                        height: height + 'px',
                        overflow: 'true',
                    };
                    emit('reflowed');
                });
                return normalRender;
            }
        };

        // reflow
        const reflowHandler = () => {
            if (token.value) clearTimeout(token.value);
            token.value = setTimeout(() => {
                initContext();
                renderManager.reflowHandler({});
                renderer();
            }, props.interval);
        };

        const autoResizeHandler = (autoResize: any) => {
            if (autoResize === false || !props.autoResize) {
                off(window, 'resize', reflowHandler, false);
            } else {
                // 监听视窗变化
                on(window, 'resize', reflowHandler, false);
            }
        };

        const flushDisplayItems = () => {
            const scrollTop = container.scrollTop || document.documentElement.scrollTop;
            const indices = virtualListManagers.getDataIndices({
                height: props.visibleHeight,
                y: Math.max(0, scrollTop - props.headerHeight),
            });

            const items: any = [];
            indices.forEach((itemIndex: number) => {
                items.push(
                    Object.freeze({
                        key: items.length,
                        ...virtualListManagers.getItem(itemIndex),
                    }),
                );
            });
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(() => {
                    displayItems.value = items;
                    nextTick(() => {
                        emit('reflowed');
                    });
                });
            } else {
                displayItems.value = items;
                nextTick(() => {
                    emit('reflowed');
                });
            }
            innerStyle.value = {
                height: virtualListManagers.totalHeight + 'px',
                overflow: 'true',
            };
        };

        watch(
            () => props.data,
            () => {
                calculate.init();
                virtualListManagers.updateGroup(props.data);
                flushDisplayItems();
            },
        );
        watch(() => props.autoResize, autoResizeHandler);

        onMounted(() => {
            initContext();

            renderer = controlRenderer(props.data);
            autoResizeHandler(props.autoResize);
        });
        onBeforeUnmount(() => {
            autoResizeHandler(false);
        });

        const getComputedStyle = (item: { [key: string]: any }) => {
            return {
                top: item.top + 'px',
                left: item.left + 'px',
                width: item.width + 'px',
                height: item.height + 'px',
            };
        };

        return {
            waterfallDom,
            innerStyle,
            displayItems,
            getComputedStyle,
        };
    },
});

export default Component;
</script>

<style lang="less">
@import './index.less';
</style>
