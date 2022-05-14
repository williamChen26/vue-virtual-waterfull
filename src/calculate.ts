import { sum } from './utils/utils';
import { EventEmitter } from 'events';

interface WaterfallContext {
    clientWidth?: number;
    maxLineGap?: string | number | undefined;
    margin?: string | number | undefined;
    lineGap?: string | number | undefined;
    align: string;
    minLineGap?: string | number | undefined;
    singleMaxWidth?: any;
    fixedHeight?: any;
    watch?: object;
    interval?: number;
}

interface Options {
    margin: any;
    align: string;
    lineGap: number;
    minLineGap: string | number | undefined;
    maxLineGap: string | number | undefined;
    singleMaxWidth: number;
    fixedHeight: boolean;
    grow: number[] | undefined;
}

export default class Calculate extends EventEmitter {
    context: any;
    strategy: any;
    arrayFillWith: any;
    timer: any;
    deletingRect: boolean;

    constructor(context: any = {}) {
        super();
        this.context = context;
        this.deletingRect = false;
    }

    set $startingstate(v: any) {
        this.deletingRect = true;
        this.arrayFillWith = v;
    }

    set contextOptions(options: WaterfallContext) {
        Object.assign(this.context, this.initOptions(options));

        this.init();
    }

    init({ width = null, strategy = null, arrayFillWith = null } = {}) {
        const w = width || this.context.clientWidth;
        this.strategy = strategy || this.getRowStrategy(w, this.context);
        this.arrayFillWith = arrayFillWith || this.getArrayFillWith(0, this.strategy.count);
    }

    initOptions(context: WaterfallContext) {
        const maxLineGap = context.maxLineGap ? +context.maxLineGap : (context.lineGap as number);
        return Object.assign(context, {
            align: ~['left', 'right', 'center'].indexOf(context.align) ? context.align : 'left',
            margin: context.margin,
            lineGap: context.lineGap ? +context.lineGap : 0,
            minLineGap: context.minLineGap ? +context.minLineGap : context.lineGap,
            maxLineGap: maxLineGap,
            singleMaxWidth: Math.max(context.singleMaxWidth || 0, maxLineGap),
            fixedHeight: !!context.fixedHeight,
        });
    }

    calculatePosition({ height = 0, width = 0 }) {
        const strategy = this.strategy;
        const context = this.context;
        const tops = this.arrayFillWith.map((x: number[]) => x);
        const offset = tops.reduce(
            (last: any, top: any, i: number) => (top < tops[last] ? i : last),
            0,
        );
        const w = strategy.width[offset % strategy.count];
        const h = height * (context.fixedHeight ? 1 : w / ((width as number) || 1));
        this.arrayFillWith[offset] += h + this.context.margin;

        return function () {
            return {
                top: tops[offset],
                left:
                    strategy.left +
                    (offset ? sum(strategy.width.slice(0, offset)) + context.margin * offset : 0),
                height: h,
                width: w,
                targetLocation: [...tops],
            };
        };
    }

    getRects(metas: any[]) {
        return metas.map((meta: any) => {
            return {
                top: meta.top || 0,
                left: meta.left || 0,
                width: meta.width || 0,
                height: meta.height || 0,
            };
        });
    }

    getTotalHeight() {
        return Math.max(...this.arrayFillWith);
    }

    getArrayFillWith(item: any, count: number) {
        const getter = typeof item === 'function' ? () => item() : () => item;
        const arr: number[] = [];
        for (let i = 0; i < count; i++) {
            arr[i] = getter();
        }
        return arr;
    }

    getLeft(width: number, contentWidth: number, align: any) {
        switch (align) {
            case 'right':
                return width - contentWidth;
            case 'center':
                return (width - contentWidth) / 2;
            default:
                return 0;
        }
    }

    getRowStrategy(width: number, options: Options) {
        let count = Math.round((width + options.margin) / (options.lineGap + options.margin));
        const innerWidth = width - options.margin * (count - 1);
        // let count = width / options.lineGap;
        let slotWidth;
        const minLineGap = Number(options.minLineGap);
        if (options.singleMaxWidth >= innerWidth) {
            count = 1;
            slotWidth = Math.max(innerWidth, minLineGap);
        } else {
            const maxContentWidth = options.maxLineGap ? Number(options.maxLineGap) * ~~count : 0;
            const minGreedyContentWidth = minLineGap * ~~(count + 1);
            const canFit = maxContentWidth >= innerWidth;
            const canFitGreedy = minGreedyContentWidth <= innerWidth;
            if (canFit && canFitGreedy) {
                count = Math.round(count);
                slotWidth = innerWidth / count;
            } else if (canFit) {
                count = ~~count;
                slotWidth = innerWidth / count;
            } else if (canFitGreedy) {
                count = ~~(count + 1);
                slotWidth = innerWidth / count;
            } else {
                count = ~~count;
                slotWidth = Number(options.maxLineGap);
            }
            if (count === 1) {
                slotWidth = Math.min(innerWidth, options.singleMaxWidth);
                slotWidth = Math.max(slotWidth, minLineGap);
            }
        }
        return {
            width: this.getArrayFillWith(slotWidth, count),
            count: count,
            left: this.getLeft(width, width, options.align),
        };
    }

    reflowHandler(initOpt: { [key: string]: any }) {
        this.init(initOpt);
    }
}

export const calculate = new Calculate();
