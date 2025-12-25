import type { Equation } from "../types";
import { DropZone } from "./DropZone";

interface EquationViewProps {
  equation: Equation;
  filledValue?: number | null;
}

export function EquationView({ equation, filledValue }: EquationViewProps) {
  const { left, op, result } = equation;

  return (
    <div style={{ fontSize: "32px", display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
      <span>{left}</span>
      <span>{op}</span>
      <DropZone displayValue={filledValue ?? "?"} />
      <span>=</span>
      <span>{result}</span>
    </div>
  );
}