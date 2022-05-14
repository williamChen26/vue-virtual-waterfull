import { EventEmitter } from 'events';
import { calculate } from './calculate';

interface Rect {
    top: number;
    left: number;
    width: number;
    height: number;
    targetLocation: any;
    key?: number | string;
    [key: number | string]: any;
}

export const RESET_REACTS = 'RESET_REACTS';
export const REGISTER_REACTS = 'INSERT_REACTS';
const DEL_REACTS = 'DEL_REACTS';

export default class RenderManager extends EventEmitter {
    private _Metadata: Rect[];
    arrayFillWith: any;
    totalHeight: number;
    timer: any;
    readyReset: boolean;

    // events
    static Events = {
        RESET_REACTS,
        REGISTER_REACTS,
        DEL_REACTS,
    };

    constructor() {
        super();
        this._Metadata = [];
        this.totalHeight = 0;
        this.readyReset = false;
    }

    set $startingstate(v: any) {
        this.readyReset = true;
        const arrayFillWith = v;
        this.arrayFillWith = v;
        this.reflowHandler({ arrayFillWith });
    }

    // 注册
    register(rect: any) {
        const { height, width } = rect;
        const raw = calculate.calculatePosition({ height, width });
        const data = raw();
        this.addMeta(data);
        this.emit(REGISTER_REACTS, this.getTotalHeight());
    }

    destroy(index: number) {
        if (index) {
            this._Metadata.splice(index, 1);
            this.emit(DEL_REACTS, index);
        }
    }

    addMeta(rect: Rect) {
        this._Metadata.push(rect);
    }

    getTotalMetasCount() {
        return this._Metadata.length;
    }

    getMetadata(index: number) {
        return this._Metadata[index];
    }

    countRectsLen() {
        return this._Metadata.length;
    }

    reflowHandler(initOpt: { [key: string]: any }) {
        calculate.reflowHandler(initOpt);
        this.emit(RESET_REACTS, '');
    }

    getTotalHeight() {
        this.totalHeight = calculate.getTotalHeight();
        return this.totalHeight;
    }
}

export const renderManager = new RenderManager();
