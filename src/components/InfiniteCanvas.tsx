"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Line,
  Arrow,
  Text,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import Konva from "konva";
import { useCanvasStore, CanvasElement } from "@/store/canvasStore";

// Grid pattern component
function GridBackground({
  stagePosition,
  stageScale,
  width,
  height,
}: {
  stagePosition: { x: number; y: number };
  stageScale: number;
  width: number;
  height: number;
}) {
  const gridSize = 40;
  const lines = [];

  const startX =
    Math.floor((-stagePosition.x / stageScale - width) / gridSize) * gridSize;
  const endX =
    Math.floor((-stagePosition.x / stageScale + 2 * width) / gridSize) *
    gridSize;
  const startY =
    Math.floor((-stagePosition.y / stageScale - height) / gridSize) * gridSize;
  const endY =
    Math.floor((-stagePosition.y / stageScale + 2 * height) / gridSize) *
    gridSize;

  for (let x = startX; x <= endX; x += gridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke="#e5e7eb"
        strokeWidth={0.5 / stageScale}
        listening={false}
      />
    );
  }
  for (let y = startY; y <= endY; y += gridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke="#e5e7eb"
        strokeWidth={0.5 / stageScale}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
}

// Hook to load images
function useImage(src: string | undefined): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.src = src;
  }, [src]);
  return image;
}

// Individual element renderers
function ImageElement({
  element,
  isSelected,
  onSelect,
  onChange,
}: {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CanvasElement>) => void;
}) {
  const image = useImage(element.imageSrc);
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  if (!image) return null;

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image}
        x={element.x}
        y={element.y}
        width={element.width || image.width}
        height={element.height || image.height}
        rotation={element.rotation || 0}
        scaleX={element.scaleX || 1}
        scaleY={element.scaleY || 1}
        draggable={true}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * node.scaleX()),
            height: Math.max(5, node.height() * node.scaleY()),
            rotation: node.rotation(),
            scaleX: 1,
            scaleY: 1,
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
}

function CanvasElementRenderer({
  element,
  isSelected,
  onSelect,
  onChange,
  onDblClick,
}: {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CanvasElement>) => void;
  onDblClick?: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shapeRef = useRef<any>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const commonProps = {
    ref: shapeRef,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDblClick: onDblClick,
    onDblTap: onDblClick,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      onChange({ x: e.target.x(), y: e.target.y() });
    },
    onTransformEnd: () => {
      const node = shapeRef.current;
      if (!node) return;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      if (element.type === "rectangle") {
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
          rotation: node.rotation(),
          scaleX: 1,
          scaleY: 1,
        });
      } else if (element.type === "circle") {
        onChange({
          x: node.x(),
          y: node.y(),
          radius: Math.max(5, (element.radius || 50) * Math.max(scaleX, scaleY)),
          rotation: node.rotation(),
          scaleX: 1,
          scaleY: 1,
        });
      } else if (element.type === "text") {
        onChange({
          x: node.x(),
          y: node.y(),
          fontSize: Math.max(8, (element.fontSize || 20) * scaleY),
          rotation: node.rotation(),
          scaleX: 1,
          scaleY: 1,
        });
      } else {
        onChange({
          x: node.x(),
          y: node.y(),
          scaleX,
          scaleY,
          rotation: node.rotation(),
        });
      }
    },
  };

  const renderShape = () => {
    switch (element.type) {
      case "rectangle":
        return (
          <Rect
            {...commonProps}
            x={element.x}
            y={element.y}
            width={element.width || 100}
            height={element.height || 100}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            rotation={element.rotation || 0}
            cornerRadius={2}
          />
        );
      case "circle":
        return (
          <Circle
            {...commonProps}
            x={element.x}
            y={element.y}
            radius={element.radius || 50}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            rotation={element.rotation || 0}
          />
        );
      case "line":
        return (
          <Line
            {...commonProps}
            x={element.x}
            y={element.y}
            points={element.points || []}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            lineCap="round"
            lineJoin="round"
          />
        );
      case "arrow":
        return (
          <Arrow
            {...commonProps}
            x={element.x}
            y={element.y}
            points={element.points || []}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            fill={element.stroke}
            pointerLength={10}
            pointerWidth={10}
          />
        );
      case "pen":
        return (
          <Line
            {...commonProps}
            x={element.x}
            y={element.y}
            points={element.points || []}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            lineCap="round"
            lineJoin="round"
            tension={0.5}
          />
        );
      case "text":
        return (
          <Text
            {...commonProps}
            x={element.x}
            y={element.y}
            text={element.text || "Text"}
            fontSize={element.fontSize || 20}
            fontFamily={element.fontFamily || "Arial"}
            fill={element.stroke}
            rotation={element.rotation || 0}
          />
        );
      default:
        return null;
    }
  };

  if (element.type === "image") {
    return (
      <ImageElement
        element={element}
        isSelected={isSelected}
        onSelect={onSelect}
        onChange={onChange}
      />
    );
  }

  return (
    <>
      {renderShape()}
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={
            element.type === "pen" || element.type === "line" || element.type === "arrow"
              ? []
              : undefined
          }
          rotateEnabled={true}
        />
      )}
    </>
  );
}

export default function InfiniteCanvas() {
  const {
    elements,
    selectedTool,
    selectedElementId,
    strokeColor,
    fillColor,
    strokeWidth,
    fontSize,
    stagePosition,
    stageScale,
    setSelectedElementId,
    setStagePosition,
    setStageScale,
    addElement,
    updateElement,
    deleteElement,
    pushHistory,
    setTool,
  } = useCanvasStore();

  const stageRef = useRef<Konva.Stage>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawingId, setCurrentDrawingId] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle image upload events
  useEffect(() => {
    const handleImageUpload = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setPendingImage(customEvent.detail);
    };
    window.addEventListener("canvas-image-upload", handleImageUpload);
    return () =>
      window.removeEventListener("canvas-image-upload", handleImageUpload);
  }, []);

  // Handle export
  useEffect(() => {
    const handleExport = () => {
      const stage = stageRef.current;
      if (!stage) return;

      // Deselect to hide transformer handles
      setSelectedElementId(null);

      // Wait a frame for transformer to unmount
      requestAnimationFrame(() => {
        // Calculate bounding box of all elements
        const layer = stage.getLayers()[1]; // content layer (index 1, grid is 0)
        if (!layer || layer.children.length === 0) return;

        const boundingBox = layer.getClientRect({ skipTransform: true });

        const padding = 40;
        const dataURL = stage.toDataURL({
          x: boundingBox.x - padding,
          y: boundingBox.y - padding,
          width: boundingBox.width + padding * 2,
          height: boundingBox.height + padding * 2,
          pixelRatio: 2,
        });

        const link = document.createElement("a");
        link.download = `canvas-${Date.now()}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    };
    window.addEventListener("canvas-export", handleExport);
    return () => window.removeEventListener("canvas-export", handleExport);
  }, [setSelectedElementId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when editing text
      if (editingTextId) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          useCanvasStore.getState().redo();
        } else {
          useCanvasStore.getState().undo();
        }
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElementId && selectedTool === "select") {
          e.preventDefault();
          deleteElement(selectedElementId);
          pushHistory();
        }
        return;
      }

      if (e.key === "Escape") {
        setSelectedElementId(null);
        return;
      }

      // Tool shortcuts
      const toolMap: Record<string, typeof selectedTool> = {
        v: "select",
        p: "pen",
        r: "rectangle",
        c: "circle",
        l: "line",
        a: "arrow",
        t: "text",
        e: "eraser",
      };
      if (!e.metaKey && !e.ctrlKey && toolMap[e.key]) {
        setTool(toolMap[e.key]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, selectedTool, editingTextId, deleteElement, pushHistory, setSelectedElementId, setTool]);

  // Get pointer position relative to stage
  const getRelativePointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    return transform.point(pos);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = stageScale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stagePosition.x) / oldScale,
        y: (pointer.y - stagePosition.y) / oldScale,
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = Math.min(
        5,
        Math.max(0.1, oldScale + direction * 0.1)
      );

      setStageScale(newScale);
      setStagePosition({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    },
    [stageScale, stagePosition, setStageScale, setStagePosition]
  );

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Only handle left click
      if (e.evt.button !== 0) return;

      const pos = getRelativePointerPosition();
      if (!pos) return;

      // Click on empty space in select mode deselects
      if (selectedTool === "select") {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
          setSelectedElementId(null);
        }
        return;
      }

      if (selectedTool === "eraser") {
        // Eraser handled by clicking on elements
        return;
      }

      if (selectedTool === "text") {
        const id = addElement({
          type: "text",
          x: pos.x,
          y: pos.y,
          text: "",
          fontSize,
          fontFamily: "Arial",
          stroke: strokeColor,
          strokeWidth: 0,
        });
        pushHistory();
        setEditingTextId(id);
        setSelectedElementId(id);

        // Create textarea for text input
        setTimeout(() => {
          const stage = stageRef.current;
          if (!stage) return;
          const container = stage.container();
          const stageBox = container.getBoundingClientRect();

          const areaPosition = {
            x: stageBox.left + pos.x * stageScale + stagePosition.x,
            y: stageBox.top + pos.y * stageScale + stagePosition.y,
          };

          const textarea = document.createElement("textarea");
          document.body.appendChild(textarea);
          textarea.value = "";
          textarea.style.position = "fixed";
          textarea.style.top = `${areaPosition.y}px`;
          textarea.style.left = `${areaPosition.x}px`;
          textarea.style.fontSize = `${fontSize * stageScale}px`;
          textarea.style.fontFamily = "Arial";
          textarea.style.color = strokeColor;
          textarea.style.border = "2px solid #3b82f6";
          textarea.style.borderRadius = "4px";
          textarea.style.padding = "4px";
          textarea.style.margin = "0";
          textarea.style.overflow = "hidden";
          textarea.style.background = "rgba(255,255,255,0.9)";
          textarea.style.outline = "none";
          textarea.style.resize = "none";
          textarea.style.lineHeight = "1.2";
          textarea.style.minWidth = "100px";
          textarea.style.minHeight = `${fontSize * stageScale * 1.5}px`;
          textarea.style.zIndex = "1000";
          textarea.focus();

          const removeTextarea = () => {
            const text = textarea.value;
            if (text.trim()) {
              useCanvasStore.getState().updateElement(id, { text });
              useCanvasStore.getState().pushHistory();
            } else {
              useCanvasStore.getState().deleteElement(id);
            }
            document.body.removeChild(textarea);
            setEditingTextId(null);
          };

          textarea.addEventListener("blur", removeTextarea);
          textarea.addEventListener("keydown", (ev) => {
            if (ev.key === "Escape") {
              textarea.removeEventListener("blur", removeTextarea);
              useCanvasStore.getState().deleteElement(id);
              document.body.removeChild(textarea);
              setEditingTextId(null);
            }
            if (ev.key === "Enter" && !ev.shiftKey) {
              ev.preventDefault();
              textarea.blur();
            }
          });

          // Auto-resize
          textarea.addEventListener("input", () => {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
            textarea.style.width = "auto";
            textarea.style.width = textarea.scrollWidth + 10 + "px";
          });
        }, 0);
        return;
      }

      if (selectedTool === "image" && pendingImage) {
        const img = new window.Image();
        img.onload = () => {
          const maxSize = 400;
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          addElement({
            type: "image",
            x: pos.x,
            y: pos.y,
            width: img.width * scale,
            height: img.height * scale,
            imageSrc: pendingImage!,
            stroke: "transparent",
            strokeWidth: 0,
          });
          pushHistory();
          setPendingImage(null);
          setTool("select");
        };
        img.src = pendingImage;
        return;
      }

      setIsDrawing(true);

      if (selectedTool === "pen") {
        const id = addElement({
          type: "pen",
          x: 0,
          y: 0,
          points: [pos.x, pos.y],
          stroke: strokeColor,
          strokeWidth,
        });
        setCurrentDrawingId(id);
      } else if (selectedTool === "rectangle") {
        const id = addElement({
          type: "rectangle",
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
        });
        setCurrentDrawingId(id);
      } else if (selectedTool === "circle") {
        const id = addElement({
          type: "circle",
          x: pos.x,
          y: pos.y,
          radius: 0,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
        });
        setCurrentDrawingId(id);
      } else if (selectedTool === "line" || selectedTool === "arrow") {
        const id = addElement({
          type: selectedTool,
          x: 0,
          y: 0,
          points: [pos.x, pos.y, pos.x, pos.y],
          stroke: strokeColor,
          strokeWidth,
        });
        setCurrentDrawingId(id);
      }
    },
    [
      selectedTool,
      strokeColor,
      fillColor,
      strokeWidth,
      fontSize,
      stageScale,
      stagePosition,
      pendingImage,
      getRelativePointerPosition,
      addElement,
      pushHistory,
      setSelectedElementId,
      setTool,
    ]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(() => {
    if (!isDrawing || !currentDrawingId) return;
    const pos = getRelativePointerPosition();
    if (!pos) return;

    const el = elements.find((e) => e.id === currentDrawingId);
    if (!el) return;

    if (selectedTool === "pen") {
      updateElement(currentDrawingId, {
        points: [...(el.points || []), pos.x, pos.y],
      });
    } else if (selectedTool === "rectangle") {
      updateElement(currentDrawingId, {
        width: pos.x - el.x,
        height: pos.y - el.y,
      });
    } else if (selectedTool === "circle") {
      const dx = pos.x - el.x;
      const dy = pos.y - el.y;
      updateElement(currentDrawingId, {
        radius: Math.sqrt(dx * dx + dy * dy),
      });
    } else if (selectedTool === "line" || selectedTool === "arrow") {
      const pts = el.points || [0, 0, 0, 0];
      updateElement(currentDrawingId, {
        points: [pts[0], pts[1], pos.x, pos.y],
      });
    }
  }, [
    isDrawing,
    currentDrawingId,
    elements,
    selectedTool,
    getRelativePointerPosition,
    updateElement,
  ]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentDrawingId(null);
      pushHistory();
    }
  }, [isDrawing, pushHistory]);

  // Handle element click (for eraser and selection)
  const handleElementClick = useCallback(
    (elementId: string) => {
      if (selectedTool === "eraser") {
        deleteElement(elementId);
        pushHistory();
      } else if (selectedTool === "select") {
        setSelectedElementId(elementId);
      }
    },
    [selectedTool, deleteElement, pushHistory, setSelectedElementId]
  );

  // Handle double-click on text to edit
  const handleTextDblClick = useCallback(
    (element: CanvasElement) => {
      if (element.type !== "text" || selectedTool !== "select") return;

      setEditingTextId(element.id);
      const stage = stageRef.current;
      if (!stage) return;
      const container = stage.container();
      const stageBox = container.getBoundingClientRect();

      const areaPosition = {
        x: stageBox.left + element.x * stageScale + stagePosition.x,
        y: stageBox.top + element.y * stageScale + stagePosition.y,
      };

      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);
      textarea.value = element.text || "";
      textarea.style.position = "fixed";
      textarea.style.top = `${areaPosition.y}px`;
      textarea.style.left = `${areaPosition.x}px`;
      textarea.style.fontSize = `${(element.fontSize || 20) * stageScale}px`;
      textarea.style.fontFamily = element.fontFamily || "Arial";
      textarea.style.color = element.stroke;
      textarea.style.border = "2px solid #3b82f6";
      textarea.style.borderRadius = "4px";
      textarea.style.padding = "4px";
      textarea.style.margin = "0";
      textarea.style.overflow = "hidden";
      textarea.style.background = "rgba(255,255,255,0.9)";
      textarea.style.outline = "none";
      textarea.style.resize = "none";
      textarea.style.lineHeight = "1.2";
      textarea.style.minWidth = "100px";
      textarea.style.zIndex = "1000";
      textarea.focus();
      textarea.select();

      const removeTextarea = () => {
        const text = textarea.value;
        if (text.trim()) {
          updateElement(element.id, { text });
          pushHistory();
        }
        document.body.removeChild(textarea);
        setEditingTextId(null);
      };

      textarea.addEventListener("blur", removeTextarea);
      textarea.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape") {
          textarea.removeEventListener("blur", removeTextarea);
          document.body.removeChild(textarea);
          setEditingTextId(null);
        }
        if (ev.key === "Enter" && !ev.shiftKey) {
          ev.preventDefault();
          textarea.blur();
        }
      });

      textarea.addEventListener("input", () => {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
        textarea.style.width = "auto";
        textarea.style.width = textarea.scrollWidth + 10 + "px";
      });
    },
    [selectedTool, stageScale, stagePosition, updateElement, pushHistory]
  );

  // Cursor style based on tool
  const getCursor = () => {
    switch (selectedTool) {
      case "select":
        return "default";
      case "pen":
        return "crosshair";
      case "eraser":
        return "pointer";
      case "text":
        return "text";
      case "image":
        return pendingImage ? "copy" : "default";
      default:
        return "crosshair";
    }
  };

  return (
    <div
      style={{ cursor: getCursor() }}
      className="w-full h-full bg-white"
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        x={stagePosition.x}
        y={stagePosition.y}
        scaleX={stageScale}
        scaleY={stageScale}
        draggable={selectedTool === "select" && !selectedElementId}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setStagePosition({
              x: e.target.x(),
              y: e.target.y(),
            });
          }
        }}
      >
        <Layer>
          <GridBackground
            stagePosition={stagePosition}
            stageScale={stageScale}
            width={dimensions.width}
            height={dimensions.height}
          />
        </Layer>
        <Layer>
          {elements.map((element) => (
            <CanvasElementRenderer
              key={element.id}
              element={element}
              isSelected={selectedElementId === element.id}
              onSelect={() => handleElementClick(element.id)}
              onChange={(updates) => {
                updateElement(element.id, updates);
                pushHistory();
              }}
              onDblClick={() => handleTextDblClick(element)}
            />
          ))}
        </Layer>
      </Stage>
      {/* Double-click handler overlay for text editing */}
      {selectedTool === "select" && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: -1 }}
        />
      )}
    </div>
  );
}
