import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export type Tool =
  | "select"
  | "pen"
  | "rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "text"
  | "image"
  | "eraser";

export interface CanvasElement {
  id: string;
  type: "pen" | "rectangle" | "circle" | "line" | "arrow" | "text" | "image";
  x: number;
  y: number;
  // Shape properties
  width?: number;
  height?: number;
  radius?: number;
  // Line/Arrow/Pen points
  points?: number[];
  // Style
  fill?: string;
  stroke: string;
  strokeWidth: number;
  opacity?: number;
  // Text
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  // Image
  imageSrc?: string;
  // Rotation
  rotation?: number;
  // Scale
  scaleX?: number;
  scaleY?: number;
}

interface CanvasState {
  elements: CanvasElement[];
  selectedTool: Tool;
  selectedElementId: string | null;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize: number;
  stagePosition: { x: number; y: number };
  stageScale: number;
  history: CanvasElement[][];
  historyIndex: number;

  // Actions
  setTool: (tool: Tool) => void;
  setSelectedElementId: (id: string | null) => void;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFontSize: (size: number) => void;
  setStagePosition: (pos: { x: number; y: number }) => void;
  setStageScale: (scale: number) => void;
  addElement: (element: Omit<CanvasElement, "id">) => string;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      elements: [],
      selectedTool: "select",
      selectedElementId: null,
      strokeColor: "#000000",
      fillColor: "transparent",
      strokeWidth: 2,
      fontSize: 20,
      stagePosition: { x: 0, y: 0 },
      stageScale: 1,
      history: [[]],
      historyIndex: 0,

      setTool: (tool) => set({ selectedTool: tool, selectedElementId: null }),
      setSelectedElementId: (id) => set({ selectedElementId: id }),
      setStrokeColor: (color) => set({ strokeColor: color }),
      setFillColor: (color) => set({ fillColor: color }),
      setStrokeWidth: (width) => set({ strokeWidth: width }),
      setFontSize: (size) => set({ fontSize: size }),
      setStagePosition: (pos) => set({ stagePosition: pos }),
      setStageScale: (scale) => set({ stageScale: scale }),

      addElement: (element) => {
        const id = uuidv4();
        set((state) => ({
          elements: [...state.elements, { ...element, id }],
        }));
        return id;
      },

      updateElement: (id, updates) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...updates } : el
          ),
        })),

      deleteElement: (id) =>
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
          selectedElementId:
            state.selectedElementId === id ? null : state.selectedElementId,
        })),

      clearCanvas: () => {
        const state = get();
        const newHistory = [
          ...state.history.slice(0, state.historyIndex + 1),
          [],
        ];
        set({
          elements: [],
          selectedElementId: null,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      pushHistory: () =>
        set((state) => {
          const newHistory = [
            ...state.history.slice(0, state.historyIndex + 1),
            [...state.elements],
          ];
          // Keep max 50 history entries
          const trimmed =
            newHistory.length > 50 ? newHistory.slice(-50) : newHistory;
          return {
            history: trimmed,
            historyIndex: trimmed.length - 1,
          };
        }),

      undo: () =>
        set((state) => {
          if (state.historyIndex <= 0) return state;
          const newIndex = state.historyIndex - 1;
          return {
            elements: [...state.history[newIndex]],
            historyIndex: newIndex,
            selectedElementId: null,
          };
        }),

      redo: () =>
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return state;
          const newIndex = state.historyIndex + 1;
          return {
            elements: [...state.history[newIndex]],
            historyIndex: newIndex,
            selectedElementId: null,
          };
        }),
    }),
    {
      name: "infinite-canvas-storage",
      partialize: (state) => ({
        elements: state.elements,
        stagePosition: state.stagePosition,
        stageScale: state.stageScale,
        strokeColor: state.strokeColor,
        fillColor: state.fillColor,
        strokeWidth: state.strokeWidth,
        fontSize: state.fontSize,
      }),
    }
  )
);
