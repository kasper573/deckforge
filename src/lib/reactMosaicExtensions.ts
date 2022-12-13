import type { MosaicNode, MosaicPath } from "react-mosaic-component";
import {
  createRemoveUpdate,
  isParent,
  updateTree,
} from "react-mosaic-component";

type MosaicKey = string | number;

export function getPathToMosaicKey<T extends MosaicKey>(
  node: MosaicNode<T>,
  key: T
): MosaicPath {
  const path = getPathToMosaicKeyImpl(node, key);
  if (path === undefined) {
    throw new Error("Key not found in tree");
  }
  return path;
}

function getPathToMosaicKeyImpl<T extends MosaicKey>(
  node: MosaicNode<T>,
  key: T
): MosaicPath | undefined {
  if (node === key) {
    return [];
  }
  if (!isParent(node)) {
    return;
  }
  let path = getPathToMosaicKeyImpl(node.first, key);
  if (path !== undefined) {
    return ["first", ...path];
  }
  path = getPathToMosaicKeyImpl(node.second, key);
  if (path !== undefined) {
    return ["second", ...path];
  }
}

export function getKeyVisibilities<T extends MosaicKey>(root?: MosaicNode<T>) {
  const queue: MosaicNode<T>[] = root !== undefined ? [root] : [];

  const visibilities = {} as Record<T, boolean>;
  while (queue.length) {
    const node = queue.pop();
    if (typeof node === "string" || typeof node === "number") {
      visibilities[node] = true;
    } else if (node !== undefined) {
      if (node.splitPercentage !== 0) {
        queue.push(node.first);
      }
      if (node.splitPercentage !== 100) {
        queue.push(node.second);
      }
    }
  }
  return visibilities;
}

export function addNodeBySplitting<T extends MosaicKey>(
  root: MosaicNode<T> | undefined,
  key: T
): MosaicNode<T> {
  if (root === undefined) {
    return key;
  }
  const direction =
    typeof root === "object"
      ? root.direction === "row"
        ? "column"
        : "row"
      : "row";
  return {
    direction,
    first: key,
    second: root,
    splitPercentage: 50,
  };
}

export function removeNodeByKey<T extends MosaicKey>(
  root: MosaicNode<T> | undefined,
  key: T
): MosaicNode<T> | undefined {
  if (root === undefined) {
    return;
  }
  const path = getPathToMosaicKey(root, key);
  if (path.length === 0) {
    return;
  }

  return updateTree(root, [createRemoveUpdate(root, path)]);
}
