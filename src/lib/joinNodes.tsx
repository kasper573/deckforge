import type { ReactNode } from "react";

export function joinNodes(nodes: ReactNode[], separator: ReactNode) {
  return nodes.reduce((result: ReactNode[], node, index) => {
    if (index > 0) {
      result.push(separator);
    }
    result.push(node);
    return result;
  }, []);
}
