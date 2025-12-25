import { useDroppable } from "@dnd-kit/core";

interface DropZoneProps { displayValue?: number | string; }

export function DropZone({ displayValue = "?" }: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "drop-zone" });

  return (
    <div
      ref={setNodeRef}
      style={{
        width: "60px",
        height: "60px",
        borderRadius: "10px",
        border: "2px dashed #bbb",
        background: isOver ? "#e5ffe5" : "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "24px",
        transition: "background 0.2s, transform 0.2s",
        transform: isOver ? "scale(1.05)" : "scale(1)",
      }}
    >
      {displayValue}
    </div>
  );
}