
export interface ITreeNode<T> {
    children?: ITreeNode<T>[];
}


/** Walk trough a tree and call an enter and leave callback */
export function walkTree<T extends ITreeNode<unknown>>(
    treeNode: T,
    /** Called before children are visited, the returned function will be called after children are visited */
    enter: (value: T) => (() => void) | undefined | void,
) {
    const leave = enter?.(treeNode);
    treeNode.children?.forEach(child => walkTree(child as any, enter));
    leave?.();
}

/** Faltten tree to an array */
export function flattenTree<T extends ITreeNode<unknown>>(treeNode: T) {
    const nodes: T[] = [];
    walkTree(treeNode, (node) => { nodes.push(node) });
    return nodes;
}

/** Create a new Tree from an existing tree */
export function mapTree<T extends ITreeNode<unknown>, U extends ITreeNode<unknown>>(
    treeNode: T,
    map: (treeNode: T) => U,
): U {
    const newNode = map(treeNode);
    newNode.children = treeNode.children?.map((node) => mapTree(node as T, map));
    return newNode;
}

/** Walk trough a tree return node  */
export function findTreeNode<T extends ITreeNode<unknown>>(
    treeNode: T,
    predicate: (value: T) => boolean,
): T | undefined {
    if (predicate(treeNode)) return treeNode;
    return treeNode.children?.find(child => findTreeNode(child as any, predicate)) as T | undefined;
}


/** Replace a node in a tree */
export function replaceTreeNode<T extends ITreeNode<unknown>>(
    rootNode: T,
    replaceNode: T,
    newNode: T,
): T {
    if (rootNode === replaceNode) return newNode;
    if (!rootNode.children) return rootNode;

    // TODO optimize to only replace the item that contains changes and it parents
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
