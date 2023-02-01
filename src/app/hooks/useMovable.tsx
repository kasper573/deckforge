import type { DragEvent } from "react";
import superjson from "superjson";

export function useMovable<Data>({
  data,
  onMove,
  enabled,
}: {
  data: Data;
  onMove: (data: Data) => void;
  enabled: boolean;
}) {
  function onDragStart(e: DragEvent) {
    e.dataTransfer?.setData("text/plain", superjson.stringify(data));
  }

  function onDrop(e: DragEvent) {
    if (e.dataTransfer) {
      onMove(superjson.parse(e.dataTransfer.getData("text/plain")) as Data);
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
  }

  return {
    onDragStart,
    onDragOver,
    onDrop,
    draggable: enabled,
  };
}
