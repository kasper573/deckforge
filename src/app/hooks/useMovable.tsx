import type { DragEvent } from "react";

export function useMovable<Data extends string>({
  data,
  onMove,
  enabled,
}: {
  data: Data;
  onMove: (data: Data) => void;
  enabled: boolean;
}) {
  function onDragStart(e: DragEvent) {
    e.dataTransfer?.setData("text/plain", data);
  }

  function onDrop(e: DragEvent) {
    if (e.dataTransfer) {
      onMove(e.dataTransfer.getData("text/plain") as Data);
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
