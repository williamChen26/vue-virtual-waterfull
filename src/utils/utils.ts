/**
 * 累加
 * @param arr 累加的数据
 * @returns @type number | string
 */
export function sum(arr?: any[]) {
    return arr?.reduce((sum, val) => sum + val);
}

/**
 * 绑定事件
 * @param elem 节点 @type HTMLElement | Window
 * @param type 事件名
 * @param listener 副作用
 * @param useCapture 冒泡/捕获
 */
export function on(elem: HTMLElement | Window, type: string, listener: EventListener, useCapture = false) {
    elem.addEventListener(type, listener, useCapture);
}

/**
 * 移除事件
 * @param elem 节点 @type HTMLElement | Window
 * @param type 事件名
 * @param listener 副作用
 * @param useCapture 冒泡/捕获
 */
export function off(
    elem: HTMLElement | Window,
    type: string,
    listener: EventListener,
    useCapture = false,
) {
    elem.removeEventListener(type, listener, useCapture);
}
