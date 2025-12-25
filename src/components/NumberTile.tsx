import { useDraggable } from "@dnd-kit/core";

interface NumberTileProps { value: number; }

export function NumberTile({ value }: NumberTileProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: `num-${value}` });

 const style: React.CSSProperties = {
  transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : "",
  padding: "10px 14px",
  background: "#f5f5f5",
  borderRadius: "8px",
  cursor: "grab",
  fontSize: "18px",
  width: "40px",
  textAlign: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
};

  return <div ref={setNodeRef} {...listeners} {...attributes} style={style}>{value}</div>;
}