
export interface ITreeNode<T> {
    children?: ITreeNode<T>[];
}


export function walkTree<T extends ITreeNode<unknown>, TResult = unknown>(
    treeNode: T,
    /** Called before children are visited */
    enter: (value: T) => TResult,
    /** Called after children are visited */
    leave?: (value: T, result: TResult) => void,
) {
    const result = enter?.(treeNode);
    treeNode.children?.forEach(child => walkTree(child as any, enter, leave));
    leave?.(treeNode, result);
}

export function flattenTree<T extends ITreeNode<unknown>>(treeNode: T) {
    const nodes: T[] = [];
    walkTree(treeNode, (node) => { nodes.push(node) });
    return nodes;
}


export function replaceTreeNode<T extends ITreeNode<unknown>>(
    rootNode: T,
    replaceNode: T,
    newNode: T,
): T {
    if (rootNode === replaceNode) return newNode;
    if (!rootNode.children) return rootNode;

    // TODO optimize to only replace the path that contains changes
    return {
        ...rootNode,
        children: rootNode.children.map(child => replaceTreeNode(child, replaceNode, newNode)),
    } as T;
}



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
