"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import {
  MousePointer2,
  Pencil,
  Square,
  Circle,
  Minus,
  MoveRight,
  Type,
  ImagePlus,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
} from "lucide-react";
import { useCanvasStore, Tool } from "@/store/canvasStore";

const tools: { tool: Tool; icon: React.ReactNode; label: string }[] = [
  { tool: "select", icon: <MousePointer2 size={28} />, label: "Select (V)" },
  { tool: "pen", icon: <Pencil size={28} />, label: "Pen (P)" },
  { tool: "rectangle", icon: <Square size={28} />, label: "Rectangle (R)" },
  { tool: "circle", icon: <Circle size={28} />, label: "Circle (C)" },
  { tool: "line", icon: <Minus size={28} />, label: "Line (L)" },
  { tool: "arrow", icon: <MoveRight size={28} />, label: "Arrow (A)" },
  { tool: "text", icon: <Type size={28} />, label: "Text (T)" },
  { tool: "image", icon: <ImagePlus size={28} />, label: "Image (I)" },
  { tool: "eraser", icon: <Eraser size={28} />, label: "Eraser (E)" },
];

export default function Toolbar() {
  const {
    selectedTool,
    setTool,
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor,
    strokeWidth,
    setStrokeWidth,
    fontSize,
    setFontSize,
    stageScale,
    setStageScale,
    setStagePosition,
    undo,
    redo,
    clearCanvas,
  } = useCanvasStore();

  const [showStrokeColorPicker, setShowStrokeColorPicker] = useState(false);
  const [showFillColorPicker, setShowFillColorPicker] = useState(false);

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setTool("image");
        // Store the image data URL in a custom event
        window.dispatchEvent(
          new CustomEvent("canvas-image-upload", {
            detail: reader.result as string,
          })
        );
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-1 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-3 py-2 shadow-sm">
      {/* Tools */}
      <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-1">
        {tools.map(({ tool, icon, label }) => (
          <button
            key={tool}
            onClick={() => {
              if (tool === "image") {
                handleImageUpload();
              } else {
                setTool(tool);
              }
            }}
            title={label}
            className={`p-2.5 rounded-md transition-colors ${
              selectedTool === tool
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-gray-300 mx-2" />

      {/* Stroke Color */}
      <div className="relative">
        <button
          onClick={() => {
            setShowStrokeColorPicker(!showStrokeColorPicker);
            setShowFillColorPicker(false);
          }}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-100 text-sm text-gray-600"
          title="Stroke color"
        >
          <div
            className="w-5 h-5 rounded border border-gray-300"
            style={{ backgroundColor: strokeColor }}
          />
          <span className="hidden sm:inline">Stroke</span>
        </button>
        {showStrokeColorPicker && (
          <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg shadow-xl border z-50">
            <HexColorPicker color={strokeColor} onChange={setStrokeColor} />
            <input
              type="text"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="mt-2 w-full px-2 py-1 text-sm border rounded text-center"
            />
          </div>
        )}
      </div>

      {/* Fill Color */}
      <div className="relative">
        <button
          onClick={() => {
            setShowFillColorPicker(!showFillColorPicker);
            setShowStrokeColorPicker(false);
          }}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-100 text-sm text-gray-600"
          title="Fill color"
        >
          <div
            className="w-5 h-5 rounded border border-gray-300"
            style={{
              backgroundColor:
                fillColor === "transparent" ? "white" : fillColor,
              backgroundImage:
                fillColor === "transparent"
                  ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)"
                  : "none",
              backgroundSize: "6px 6px",
              backgroundPosition: "0 0, 3px 3px",
            }}
          />
          <span className="hidden sm:inline">Fill</span>
        </button>
        {showFillColorPicker && (
          <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg shadow-xl border z-50">
            <HexColorPicker color={fillColor === "transparent" ? "#ffffff" : fillColor} onChange={setFillColor} />
            <div className="mt-2 flex gap-1">
              <input
                type="text"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border rounded text-center"
              />
              <button
                onClick={() => setFillColor("transparent")}
                className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
              >
                None
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-gray-300 mx-2" />

      {/* Stroke Width */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500">Width</span>
        <input
          type="range"
          min={1}
          max={20}
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="w-20 accent-blue-500"
        />
        <span className="text-xs text-gray-500 w-4">{strokeWidth}</span>
      </div>

      {/* Font Size (only when text tool is selected) */}
      {selectedTool === "text" && (
        <>
          <div className="w-px h-8 bg-gray-300 mx-2" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Font</span>
            <input
              type="range"
              min={10}
              max={72}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-20 accent-blue-500"
            />
            <span className="text-xs text-gray-500 w-5">{fontSize}</span>
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={undo}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={redo}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={18} />
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-gray-300 mx-2" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setStageScale(Math.max(0.1, stageScale - 0.1))}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
          title="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs text-gray-500 w-10 text-center">
          {Math.round(stageScale * 100)}%
        </span>
        <button
          onClick={() => setStageScale(Math.min(5, stageScale + 0.1))}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
          title="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => {
            setStageScale(1);
            setStagePosition({ x: 0, y: 0 });
          }}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
          title="Reset view"
        >
          <Maximize size={16} />
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-gray-300 mx-2" />

      {/* Export */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("canvas-export"))}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        title="Export as image"
      >
        <Download size={18} />
      </button>

      {/* Clear */}
      <button
        onClick={clearCanvas}
        className="p-2 rounded-md text-red-500 hover:bg-red-50"
        title="Clear canvas"
      >
        <Trash2 size={18} />
      </button>

      {/* Click-away to close color pickers */}
      {(showStrokeColorPicker || showFillColorPicker) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowStrokeColorPicker(false);
            setShowFillColorPicker(false);
          }}
        />
      )}
    </div>
  );
}
