
export type TreeList<T = unknown> = TreeNode<T>[];

export class TreeNode<T = unknown> implements TreeNode<T> {
    constructor(
        public value: T,
        public children: TreeList<T> = [],
    ) {
    }

    /** Walk this item and its children */
    public walk<TResult>(
        /** Called before children are visited */
        enter: (value: T) => TResult,
        /** Called after children are visited */
        leave?: (value: T, result: TResult) => void,
    ) {
        const result = enter?.(this.value);
        this.children.forEach(child => child.walk(enter, leave));
        leave?.(this.value, result);
    }

    /** Filter TreeNode into a new TreeNode */
    public filter(
        predicate: (value: T) => boolean,
    ) {
        const result = predicate(this.value);
        if (!result) return undefined;
        const filtered = this.children.filter(child => child.filter(predicate));
        if (filtered.length === this.children.length) return this;
        return new TreeNode<T>(this.value, this.children);
    }

    public flatten() {
        const newArray: T[] = [];
        this.walk(item => newArray.push(item));
        return newArray;
    }
}
