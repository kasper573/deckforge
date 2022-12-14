import type { ReactNode } from "react";

export function joinNodes(nodes: ReactNode[], separator: ReactNode) {
  return nodes.reduce(
    (acc: ReactNode, node, index) => (
      <>
        {acc}
        {index > 0 ? separator : undefined}
        {node}
      </>
    ),
    <></>
  );
}
