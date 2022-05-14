import SectionManager from './section-manager';
import Calculate from './calculate';

interface Rect {
    top: number;
    left: number;
    width: number;
    height: number;
    targetLocation: any;
    key?: number | string;
    [key: number | string]: any;
}

export default class GeneralManager {
    private _preRangeRender: any;
    private _data: any;
    private _sectionManager: SectionManager | undefined;
    private _calculate: Calculate;
    totalHeight: number | undefined;
    totalWidth: number | undefined;
    constructor({ data = [], preRangeRender = 0, calculate = new Calculate([]) } = {}) {
        this._calculate = calculate;
        this._preRangeRender = preRangeRender;
        this.updateGroup(data);
    }

    updateGroup(data: any) {
        const sectionManager = new SectionManager(this._preRangeRender);
        let totalHeight = 0;
        let totalWidth = 0;
        data.forEach((item: any, index: any) => {
            const { height, width } = item;
            const raw = this._calculate.calculatePosition({ height, width });
            // result meta
            const resultRaw: Rect = raw();
            sectionManager.register({
                index,
                meta: resultRaw,
            });
            data[index] = Object.assign(item, resultRaw);
            // compute total height and total width
            const bottom = resultRaw.top + resultRaw.height;
            const right = resultRaw.left + resultRaw.width;
            if (bottom > totalHeight) {
                totalHeight = bottom;
            }
            if (right > totalWidth) {
                totalWidth = right;
            }
        });

        // sectionManager.freezeCells();
        this._sectionManager = sectionManager;
        this.totalHeight = totalHeight;
        this.totalWidth = totalWidth;
        this._data = data;
    }

    getDataIndices(region = {}) {
        if (!this._sectionManager) return null;
        return this._sectionManager.getDataIndices(region);
    }

    getItem(index: number) {
        return this._data[index];
    }
}
