import Section from './section';

const PRE_RENDERRANGE = 200;
const RENDERRANGE = 1000;

interface Rect {
    top: number;
    left: number;
    width: number;
    height: number;
    targetLocation: any;
    key?: number | string;
    [key: number | string]: any;
}
export default class SectionManager {
    private _preRenderRange: number;
    private _renderRange: number;
    private _sections: any;
    private _Metadata: any[];
    constructor({ preRenderRange = PRE_RENDERRANGE, renderRange = RENDERRANGE }) {
        this._preRenderRange = preRenderRange;
        this._renderRange = renderRange;

        this._Metadata = [];
        this._sections = {};
    }

    register({ meta, index }: { meta: Rect; index: number }) {
        this._Metadata[index] = meta;

        this.getSections({ height: meta.height, y: meta.top }).forEach((section) =>
            section.addCellIndex({ index }),
        );
    }

    freezeCells() {
        Object.freeze(this._Metadata);
    }

    /** Get all Sections overlapping the specified region. */
    getSections({ height, y }: { height: number; y: number }) {
        const sectionYStart = Math.floor(y / (this._renderRange + this._preRenderRange));
        const sectionYStop = Math.floor((y + height) / this._renderRange);

        const sections = [];

        for (let sectionY = sectionYStart; sectionY <= sectionYStop; sectionY++) {
            const key = sectionY;

            if (!this._sections[key]) {
                this._sections[key] = new Section();
            }

            sections.push(this._sections[key]);
        }

        return sections;
    }

    getTotalSectionCount() {
        return Object.keys(this._sections).length;
    }

    getDataIndices({ height = 0, y = 0 }) {
        const indices: { [key: number]: any } = {};

        this.getSections({ height, y }).forEach((section) => {
            section.getDataIndices().forEach((index: number) => {
                indices[index] = index;
            });
        });

        // Object keys are strings; this function returns numbers
        return Object.keys(indices).map((index: string) => indices[+index]);
    }
}
