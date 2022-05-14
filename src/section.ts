export default class Section {
    private _indexMap: any;
    private _indices: any[];
    constructor() {
        this._indexMap = {};
        this._indices = [];
    }

    addCellIndex({ index }: { index: number }) {
        if (!this._indexMap[index]) {
            this._indexMap[index] = true;
            this._indices.push(index);
        }
    }

    /** section. */
    getDataIndices() {
        return this._indices;
    }
}
