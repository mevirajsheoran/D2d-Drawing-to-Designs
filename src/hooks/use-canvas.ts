"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import {
  Shape,
  Tool,
  setTool,
  selectShape,
  deselectShape,
  clearSelection,
  addFrame,
  addRect,
  addEllipse,
  addArrow,
  addLine,
  addText,
  addFreeDrawShape,
  updateShape,
  removeShape,
  deleteSelected,
  FreeDrawShape,
  ArrowShape,
  LineShape,
  TextShape,
  FrameShape,
  RectShape,
  EllipseShape,
} from "@/redux/slice/shapes";
import {
  panStart,
  panMove,
  panEnd,
  wheelZoom,
  wheelPan,
  zoomIn,
  zoomOut,
  resetView,
  Point,
} from "@/redux/slice/viewport";

/* ======================================================
   Types
====================================================== */
interface DraftShape {
  type: "frame" | "rect" | "ellipse" | "arrow" | "line" | null;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

type ResizeCorner = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

interface ResizingData {
  shapeId: string;
  corner: ResizeCorner;
  initialBounds: { x: number; y: number; w: number; h: number };
  startPoint: Point;
}

/* ======================================================
   Constants
====================================================== */
const FREEHAND_INTERVAL_MS = 16; // 60fps
const HIT_THRESHOLD = 8;

/* ======================================================
   Main Hook
====================================================== */
export function useCanvas() {
  const dispatch = useAppDispatch();

  // ============================================
  // REDUX STATE
  // ============================================
  const viewport = useAppSelector((state) => state.viewport);
  const shapesState = useAppSelector((state) => state.shapes);
  const currentTool = useAppSelector((state) => state.shapes.tool);

  // Convert entity state to array
  const shapeList: Shape[] = useMemo(() => {
    const { ids, entities } = shapesState.shapes;
    const idArray = Array.isArray(ids) ? ids : [];
    return idArray
      .map((id: string) => entities[id])
      .filter((shape): shape is Shape => shape !== undefined && shape !== null);
  }, [shapesState.shapes]);

  // Selected IDs
  const selectedIds = useMemo(() => {
    return Object.keys(shapesState.selected || {});
  }, [shapesState.selected]);

  // Shape entities for quick lookup
  const shapeEntities = useMemo(() => shapesState.shapes.entities, [shapesState.shapes.entities]);

  // Check if text is selected
  const hasSelectedText = useMemo(() => {
    return selectedIds.some((id) => {
      const shape = shapeEntities[id];
      return shape?.type === "text";
    });
  }, [selectedIds, shapeEntities]);

  // ============================================
  // LOCAL STATE
  // ============================================
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setForceUpdate] = useState(0);

  // ============================================
  // REFS
  // ============================================
  const canvasRef = useRef<HTMLDivElement>(null);
  const draftShapeRef = useRef<DraftShape | null>(null);
  const freePointsRef = useRef<Point[]>([]);

  // Keyboard state
  const spacePressed = useRef(false);
  const shiftPressed = useRef(false);
  const ctrlPressed = useRef(false);

  // Interaction state
  const drawingRef = useRef(false);
  const movingRef = useRef(false);
  const moveStartRef = useRef<Point | null>(null);
  const initialShapePositionsRef = useRef<Map<string, any>>(new Map());
  const erasingRef = useRef(false);
  const erasedShapesRef = useRef<Set<string>>(new Set());
  const resizingRef = useRef(false);
  const resizingDataRef = useRef<ResizingData | null>(null);

  // Animation refs
  const freehandAnimationRef = useRef<number | null>(null);
  const lastFreehandFrameRef = useRef<number>(0);
  const panAnimationRef = useRef<number | null>(null);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const requestRender = useCallback(() => {
    setForceUpdate((n) => (n + 1) % 1000000);
  }, []);

  const screenToCanvas = useCallback(
    (clientX: number, clientY: number): Point => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: clientX, y: clientY };

      return {
        x: (clientX - rect.left - viewport.translate.x) / viewport.scale,
        y: (clientY - rect.top - viewport.translate.y) / viewport.scale,
      };
    },
    [viewport.translate.x, viewport.translate.y, viewport.scale]
  );

  const getLocalPoint = useCallback(
    (e: { clientX: number; clientY: number }): Point => {
      return screenToCanvas(e.clientX, e.clientY);
    },
    [screenToCanvas]
  );

  // ============================================
  // HIT TESTING
  // ============================================

  const distanceToLineSegment = useCallback(
    (point: Point, lineStart: Point, lineEnd: Point): number => {
      const a = point.x - lineStart.x;
      const b = point.y - lineStart.y;
      const c = lineEnd.x - lineStart.x;
      const d = lineEnd.y - lineStart.y;

      const dot = a * c + b * d;
      const lenSq = c * c + d * d;
      let param = -1;

      if (lenSq !== 0) param = dot / lenSq;

      let xx: number, yy: number;

      if (param < 0) {
        xx = lineStart.x;
        yy = lineStart.y;
      } else if (param > 1) {
        xx = lineEnd.x;
        yy = lineEnd.y;
      } else {
        xx = lineStart.x + param * c;
        yy = lineStart.y + param * d;
      }

      return Math.sqrt((point.x - xx) ** 2 + (point.y - yy) ** 2);
    },
    []
  );

  const isPointInShape = useCallback(
    (point: Point, shape: Shape): boolean => {
      switch (shape.type) {
        case "frame":
        case "rect":
        case "ellipse": {
          const s = shape as FrameShape | RectShape | EllipseShape;
          return (
            point.x >= s.x &&
            point.x <= s.x + s.w &&
            point.y >= s.y &&
            point.y <= s.y + s.h
          );
        }

        case "freedraw": {
          const freeShape = shape as FreeDrawShape;
          for (let i = 0; i < freeShape.points.length - 1; i++) {
            const distance = distanceToLineSegment(
              point,
              freeShape.points[i],
              freeShape.points[i + 1]
            );
            if (distance < HIT_THRESHOLD) return true;
          }
          return false;
        }

        case "arrow":
        case "line": {
          const lineShape = shape as ArrowShape | LineShape;
          const distance = distanceToLineSegment(
            point,
            { x: lineShape.startX, y: lineShape.startY },
            { x: lineShape.endX, y: lineShape.endY }
          );
          return distance < HIT_THRESHOLD;
        }

        case "text": {
          const textShape = shape as TextShape;
          const textWidth = Math.max(100, textShape.text.length * textShape.fontSize * 0.6);
          const textHeight = textShape.fontSize * 1.5;
          return (
            point.x >= textShape.x - 8 &&
            point.x <= textShape.x + textWidth + 8 &&
            point.y >= textShape.y - 8 &&
            point.y <= textShape.y + textHeight + 8
          );
        }

        default:
          return false;
      }
    },
    [distanceToLineSegment]
  );

  const getShapeAtPoint = useCallback(
    (point: Point): Shape | null => {
      for (let i = shapeList.length - 1; i >= 0; i--) {
        if (isPointInShape(point, shapeList[i])) {
          return shapeList[i];
        }
      }
      return null;
    },
    [shapeList, isPointInShape]
  );

  // ============================================
  // ANIMATION HELPERS
  // ============================================

  const schedulePanMove = useCallback(
    (newPoint: Point) => {
      if (panAnimationRef.current !== null) return;

      panAnimationRef.current = window.requestAnimationFrame(() => {
        panAnimationRef.current = null;
        dispatch(panMove(newPoint));
      });
    },
    [dispatch]
  );

  const freehandTick = useCallback(() => {
    const now = performance.now();

    if (now - lastFreehandFrameRef.current >= FREEHAND_INTERVAL_MS) {
      if (freePointsRef.current.length > 0) {
        requestRender();
      }
      lastFreehandFrameRef.current = now;
    }

    if (drawingRef.current) {
      freehandAnimationRef.current = window.requestAnimationFrame(freehandTick);
    }
  }, [requestRender]);

  // ============================================
  // WHEEL EVENTS
  // ============================================

  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Zoom
        dispatch(
          wheelZoom({
            deltaY: e.deltaY,
            originScreen: { x: e.clientX, y: e.clientY },
          })
        );
      } else {
        // Pan
        dispatch(wheelPan({ dx: -e.deltaX, dy: -e.deltaY }));
      }
    },
    [dispatch]
  );

  // ============================================
  // POINTER EVENTS
  // ============================================

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;

      // Check for interactive elements
      const isButton = target.tagName === "BUTTON" || target.closest("button");
      if (isButton) return;

      e.preventDefault();
      canvasRef.current?.setPointerCapture(e.pointerId);

      const world = getLocalPoint(e);

      // Pan with middle/right click or space+click
      const isPanButton = e.button === 1 || e.button === 2;
      const isPanBySpace = spacePressed.current && e.button === 0;

      if (isPanButton || isPanBySpace || currentTool === "pan") {
        dispatch(panStart({ screen: { x: e.clientX, y: e.clientY } }));
        return;
      }

      // Left click
      if (e.button === 0) {
        // SELECT TOOL
        if (currentTool === "select") {
          const hitShape = getShapeAtPoint(world);

          if (hitShape) {
            const isAlreadySelected = selectedIds.includes(hitShape.id);

            if (!isAlreadySelected) {
              if (!e.shiftKey) dispatch(clearSelection());
              dispatch(selectShape(hitShape.id));
            }

            // Start moving
            movingRef.current = true;
            moveStartRef.current = world;
            initialShapePositionsRef.current = new Map();

            const idsToMove = isAlreadySelected ? selectedIds : [hitShape.id];

            idsToMove.forEach((id) => {
              const shape = shapeEntities[id];
              if (!shape) return;

              if (["frame", "rect", "ellipse", "text"].includes(shape.type)) {
                initialShapePositionsRef.current.set(id, {
                  x: (shape as any).x,
                  y: (shape as any).y,
                });
              } else if (shape.type === "freedraw") {
                const freeShape = shape as FreeDrawShape;
                initialShapePositionsRef.current.set(id, {
                  points: [...freeShape.points],
                });
              } else if (shape.type === "arrow" || shape.type === "line") {
                const lineShape = shape as ArrowShape | LineShape;
                initialShapePositionsRef.current.set(id, {
                  startX: lineShape.startX,
                  startY: lineShape.startY,
                  endX: lineShape.endX,
                  endY: lineShape.endY,
                });
              }
            });
          } else {
            dispatch(clearSelection());
          }
        }

        // ERASER TOOL
        else if (currentTool === "eraser") {
          erasingRef.current = true;
          erasedShapesRef.current.clear();

          const hitShape = getShapeAtPoint(world);
          if (hitShape) {
            dispatch(removeShape(hitShape.id));
            erasedShapesRef.current.add(hitShape.id);
          }
        }

        // TEXT TOOL
        else if (currentTool === "text") {
          dispatch(addText({ x: world.x, y: world.y }));
          dispatch(setTool("select"));
        }

        // DRAWING TOOLS
        else if (["frame", "rect", "ellipse", "arrow", "line"].includes(currentTool)) {
          drawingRef.current = true;
          draftShapeRef.current = {
            type: currentTool as DraftShape["type"],
            startX: world.x,
            startY: world.y,
            endX: world.x,
            endY: world.y,
          };
          requestRender();
        }

        // FREEDRAW TOOL
        else if (currentTool === "freedraw") {
          drawingRef.current = true;
          freePointsRef.current = [world];
          lastFreehandFrameRef.current = performance.now();
          freehandAnimationRef.current = window.requestAnimationFrame(freehandTick);
          requestRender();
        }
      }
    },
    [
      currentTool,
      selectedIds,
      shapeEntities,
      dispatch,
      getLocalPoint,
      getShapeAtPoint,
      requestRender,
      freehandTick,
    ]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const world = getLocalPoint(e);

      // Panning
      if (viewport.mode === "panning" || viewport.mode === "shiftPanning") {
        schedulePanMove({ x: e.clientX, y: e.clientY });
        return;
      }

      // Resizing
      if (resizingRef.current && resizingDataRef.current) {
        const { shapeId, corner, initialBounds } = resizingDataRef.current;
        let newBounds = { ...initialBounds };

        switch (corner) {
          case "nw":
            newBounds.w = initialBounds.w + (initialBounds.x - world.x);
            newBounds.h = initialBounds.h + (initialBounds.y - world.y);
            newBounds.x = world.x;
            newBounds.y = world.y;
            break;
          case "n":
            newBounds.h = initialBounds.h + (initialBounds.y - world.y);
            newBounds.y = world.y;
            break;
          case "ne":
            newBounds.w = world.x - initialBounds.x;
            newBounds.h = initialBounds.h + (initialBounds.y - world.y);
            newBounds.y = world.y;
            break;
          case "e":
            newBounds.w = world.x - initialBounds.x;
            break;
          case "se":
            newBounds.w = world.x - initialBounds.x;
            newBounds.h = world.y - initialBounds.y;
            break;
          case "s":
            newBounds.h = world.y - initialBounds.y;
            break;
          case "sw":
            newBounds.w = initialBounds.w + (initialBounds.x - world.x);
            newBounds.h = world.y - initialBounds.y;
            newBounds.x = world.x;
            break;
          case "w":
            newBounds.w = initialBounds.w + (initialBounds.x - world.x);
            newBounds.x = world.x;
            break;
        }

        // Ensure minimum size
        if (newBounds.w < 10) newBounds.w = 10;
        if (newBounds.h < 10) newBounds.h = 10;

        dispatch(
          updateShape({
            id: shapeId,
            patch: {
              x: newBounds.x,
              y: newBounds.y,
              w: Math.abs(newBounds.w),
              h: Math.abs(newBounds.h),
            },
          })
        );
        return;
      }

      // Erasing
      if (erasingRef.current && currentTool === "eraser") {
        const hitShape = getShapeAtPoint(world);
        if (hitShape && !erasedShapesRef.current.has(hitShape.id)) {
          dispatch(removeShape(hitShape.id));
          erasedShapesRef.current.add(hitShape.id);
        }
      }

      // Moving shapes
      if (movingRef.current && moveStartRef.current && currentTool === "select") {
        const deltaX = world.x - moveStartRef.current.x;
        const deltaY = world.y - moveStartRef.current.y;

        initialShapePositionsRef.current.forEach((initialPos, id) => {
          const shape = shapeEntities[id];
          if (!shape) return;

          if (["frame", "rect", "ellipse", "text"].includes(shape.type)) {
            dispatch(
              updateShape({
                id,
                patch: {
                  x: initialPos.x + deltaX,
                  y: initialPos.y + deltaY,
                },
              })
            );
          } else if (shape.type === "freedraw") {
            const newPoints = initialPos.points.map((p: Point) => ({
              x: p.x + deltaX,
              y: p.y + deltaY,
            }));
            dispatch(updateShape({ id, patch: { points: newPoints } }));
          } else if (shape.type === "arrow" || shape.type === "line") {
            dispatch(
              updateShape({
                id,
                patch: {
                  startX: initialPos.startX + deltaX,
                  startY: initialPos.startY + deltaY,
                  endX: initialPos.endX + deltaX,
                  endY: initialPos.endY + deltaY,
                },
              })
            );
          }
        });
      }

      // Drawing draft shapes
      if (drawingRef.current && draftShapeRef.current) {
        draftShapeRef.current.endX = world.x;
        draftShapeRef.current.endY = world.y;
        requestRender();
      }

      // Freedraw
      if (currentTool === "freedraw" && drawingRef.current) {
        freePointsRef.current.push(world);
      }
    },
    [
      currentTool,
      viewport.mode,
      shapeEntities,
      dispatch,
      getLocalPoint,
      getShapeAtPoint,
      schedulePanMove,
      requestRender,
    ]
  );

  const finalizeDrawing = useCallback(() => {
    if (!drawingRef.current) return;

    drawingRef.current = false;

    // Cancel freehand animation
    if (freehandAnimationRef.current) {
      cancelAnimationFrame(freehandAnimationRef.current);
      freehandAnimationRef.current = null;
    }

    const draft = draftShapeRef.current;

    if (draft) {
      const x = Math.min(draft.startX, draft.endX);
      const y = Math.min(draft.startY, draft.endY);
      const w = Math.abs(draft.endX - draft.startX);
      const h = Math.abs(draft.endY - draft.startY);

      if (w > 5 || h > 5) {
        if (draft.type === "frame") {
          dispatch(addFrame({ x, y, w, h }));
        } else if (draft.type === "rect") {
          dispatch(addRect({ x, y, w, h }));
        } else if (draft.type === "ellipse") {
          dispatch(addEllipse({ x, y, w, h }));
        } else if (draft.type === "arrow") {
          dispatch(
            addArrow({
              startX: draft.startX,
              startY: draft.startY,
              endX: draft.endX,
              endY: draft.endY,
            })
          );
        } else if (draft.type === "line") {
          dispatch(
            addLine({
              startX: draft.startX,
              startY: draft.startY,
              endX: draft.endX,
              endY: draft.endY,
            })
          );
        }
      }

      draftShapeRef.current = null;
    }

    // Freedraw
    if (currentTool === "freedraw" && freePointsRef.current.length > 1) {
      dispatch(addFreeDrawShape({ points: [...freePointsRef.current] }));
      freePointsRef.current = [];
    }

    requestRender();
  }, [currentTool, dispatch, requestRender]);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      canvasRef.current?.releasePointerCapture(e.pointerId);

      if (viewport.mode === "panning" || viewport.mode === "shiftPanning") {
        dispatch(panEnd());
      }

      if (movingRef.current) {
        movingRef.current = false;
        moveStartRef.current = null;
        initialShapePositionsRef.current = new Map();
      }

      if (resizingRef.current) {
        resizingRef.current = false;
        resizingDataRef.current = null;
      }

      if (erasingRef.current) {
        erasingRef.current = false;
        erasedShapesRef.current.clear();
      }

      finalizeDrawing();
    },
    [viewport.mode, dispatch, finalizeDrawing]
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerUp(e);
    },
    [onPointerUp]
  );

  // ============================================
  // RESIZE HANDLERS
  // ============================================

  const startResize = useCallback(
    (shapeId: string, corner: ResizeCorner, e: React.PointerEvent) => {
      e.stopPropagation();
      const shape = shapeEntities[shapeId];
      if (!shape) return;

      resizingRef.current = true;
      resizingDataRef.current = {
        shapeId,
        corner,
        initialBounds: {
          x: (shape as any).x,
          y: (shape as any).y,
          w: (shape as any).w,
          h: (shape as any).h,
        },
        startPoint: getLocalPoint(e),
      };
    },
    [shapeEntities, getLocalPoint]
  );

  // ============================================
  // KEYBOARD EVENTS
  // ============================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Modifier keys
      if (e.code === "Space") {
        e.preventDefault();
        spacePressed.current = true;
      }
      if (e.shiftKey) shiftPressed.current = true;
      if (e.ctrlKey || e.metaKey) ctrlPressed.current = true;

      // Delete
      if (e.code === "Delete" || e.code === "Backspace") {
        if (selectedIds.length > 0) {
          e.preventDefault();
          dispatch(deleteSelected());
        }
      }

      // Escape - clear selection
      if (e.code === "Escape") {
        dispatch(clearSelection());
        dispatch(setTool("select"));
      }

      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey) {
        switch (e.code) {
          case "KeyV":
            dispatch(setTool("select"));
            break;
          case "KeyH":
            dispatch(setTool("pan"));
            break;
          case "KeyF":
            dispatch(setTool("frame"));
            break;
          case "KeyR":
            dispatch(setTool("rect"));
            break;
          case "KeyO":
            dispatch(setTool("ellipse"));
            break;
          case "KeyP":
            dispatch(setTool("freedraw"));
            break;
          case "KeyA":
            dispatch(setTool("arrow"));
            break;
          case "KeyL":
            dispatch(setTool("line"));
            break;
          case "KeyT":
            dispatch(setTool("text"));
            break;
          case "KeyE":
            dispatch(setTool("eraser"));
            break;
        }
      }

      // Zoom shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          dispatch(zoomIn());
        }
        if (e.key === "-") {
          e.preventDefault();
          dispatch(zoomOut());
        }
        if (e.key === "0") {
          e.preventDefault();
          dispatch(resetView());
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") spacePressed.current = false;
      if (!e.shiftKey) shiftPressed.current = false;
      if (!e.ctrlKey && !e.metaKey) ctrlPressed.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      if (freehandAnimationRef.current) {
        cancelAnimationFrame(freehandAnimationRef.current);
      }
      if (panAnimationRef.current) {
        cancelAnimationFrame(panAnimationRef.current);
      }
    };
  }, [selectedIds, dispatch]);

  // ============================================
  // TEXT SIDEBAR
  // ============================================

  useEffect(() => {
    if (hasSelectedText && !sidebarOpen) {
      setSidebarOpen(true);
    } else if (!hasSelectedText && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [hasSelectedText, sidebarOpen]);

  // ============================================
  // CANVAS REF
  // ============================================

  const attachCanvasRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("wheel", onWheel as any);
      }

      canvasRef.current = element;

      if (element) {
        element.addEventListener("wheel", onWheel as any, { passive: false });
      }
    },
    [onWheel]
  );

  // ============================================
  // HELPERS
  // ============================================

  const selectToolFn = useCallback(
    (tool: Tool) => {
      dispatch(setTool(tool));
    },
    [dispatch]
  );

  const getDraftShape = useCallback(() => draftShapeRef.current, []);
  const getFreeDrawPoints = useCallback(() => freePointsRef.current, []);

  const handleZoomIn = useCallback(() => dispatch(zoomIn()), [dispatch]);
  const handleZoomOut = useCallback(() => dispatch(zoomOut()), [dispatch]);
  const handleResetZoom = useCallback(() => dispatch(resetView()), [dispatch]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    viewport,
    shapeList,
    currentTool,
    selectedIds,
    shapeEntities,
    hasSelectedText,
    sidebarOpen,

    // Pointer handlers
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,

    // Helpers
    attachCanvasRef,
    selectTool: selectToolFn,
    setSidebarOpen,
    getDraftShape,
    getFreeDrawPoints,
    startResize,

    // Zoom
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,

    // Utility
    screenToCanvas,
    getShapeAtPoint,
  };
}