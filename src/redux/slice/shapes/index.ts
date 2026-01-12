import {
  createSlice,
  createEntityAdapter,
  nanoid,
  PayloadAction,
  EntityState,
} from "@reduxjs/toolkit";
import type { Point } from "../viewport";

/* ======================================================
   Tool Types
====================================================== */
export type Tool =
  | "select"
  | "pan"
  | "frame"
  | "rect"
  | "ellipse"
  | "freedraw"
  | "arrow"
  | "line"
  | "text"
  | "eraser";

/* ======================================================
   Shape Types
====================================================== */
export interface BaseShape {
  id: string;
  stroke: string;
  strokeWidth: number;
  fill?: string | null;
}

export interface FrameShape extends BaseShape {
  type: "frame";
  x: number;
  y: number;
  w: number;
  h: number;
  frameNumber: number;
}

export interface RectShape extends BaseShape {
  type: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface EllipseShape extends BaseShape {
  type: "ellipse";
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FreeDrawShape extends BaseShape {
  type: "freedraw";
  points: Point[];
}

export interface ArrowShape extends BaseShape {
  type: "arrow";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface LineShape extends BaseShape {
  type: "line";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface TextShape extends BaseShape {
  type: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  textDecoration: "none" | "underline" | "line-through";
  lineHeight: number;
  letterSpacing: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
}

export interface GeneratedUIShape extends BaseShape {
  type: "generatedui";
  x: number;
  y: number;
  w: number;
  h: number;
  uiSpecData: string | null;
  sourceFrameId: string;
  isWorkflowPage?: boolean;
}

export type Shape =
  | FrameShape
  | RectShape
  | EllipseShape
  | FreeDrawShape
  | ArrowShape
  | LineShape
  | TextShape
  | GeneratedUIShape;

/* ======================================================
   Entity Adapter
====================================================== */
const shapesAdapter = createEntityAdapter<Shape, string>({
  selectId: (s) => s.id,
});

type SelectionMap = Record<string, true>;

interface ShapesState {
  tool: Tool;
  shapes: EntityState<Shape, string>;
  selected: SelectionMap;
  frameCounter: number;
  isDrawing: boolean;
  currentDrawingId: string | null;
}

const initialState: ShapesState = {
  tool: "select",
  shapes: shapesAdapter.getInitialState(),
  selected: {},
  frameCounter: 0,
  isDrawing: false,
  currentDrawingId: null,
};

/* ======================================================
   Shape Factory Functions
====================================================== */
const DEFAULTS = { stroke: "#ffffff", strokeWidth: 2 as const };

const makeFrame = (p: {
  x: number;
  y: number;
  w: number;
  h: number;
  frameNumber: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): FrameShape => ({
  id: nanoid(),
  type: "frame",
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
  frameNumber: p.frameNumber,
  stroke: "transparent",
  strokeWidth: 0,
  fill: p.fill ?? "rgba(255, 255, 255, 0.05)",
});

const makeRect = (p: {
  x: number;
  y: number;
  w: number;
  h: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): RectShape => ({
  id: nanoid(),
  type: "rect",
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,
});

const makeEllipse = (p: {
  x: number;
  y: number;
  w: number;
  h: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): EllipseShape => ({
  id: nanoid(),
  type: "ellipse",
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,
});

const makeFree = (p: {
  points: Point[];
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): FreeDrawShape => ({
  id: nanoid(),
  type: "freedraw",
  points: p.points,
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,
});

const makeArrow = (p: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): ArrowShape => ({
  id: nanoid(),
  type: "arrow",
  startX: p.startX,
  startY: p.startY,
  endX: p.endX,
  endY: p.endY,
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,
});

const makeLine = (p: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): LineShape => ({
  id: nanoid(),
  type: "line",
  startX: p.startX,
  startY: p.startY,
  endX: p.endX,
  endY: p.endY,
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,
});

const makeText = (p: {
  x: number;
  y: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right";
  textDecoration?: "none" | "underline" | "line-through";
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): TextShape => ({
  id: nanoid(),
  type: "text",
  x: p.x,
  y: p.y,
  text: p.text ?? "Type here...",
  fontSize: p.fontSize ?? 16,
  fontFamily: p.fontFamily ?? "Inter, sans-serif",
  fontWeight: p.fontWeight ?? 400,
  fontStyle: p.fontStyle ?? "normal",
  textAlign: p.textAlign ?? "left",
  textDecoration: p.textDecoration ?? "none",
  lineHeight: p.lineHeight ?? 1.2,
  letterSpacing: p.letterSpacing ?? 0,
  textTransform: p.textTransform ?? "none",
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? "#ffffff",
});

const makeGeneratedUI = (p: {
  x: number;
  y: number;
  w: number;
  h: number;
  uiSpecData: string | null;
  sourceFrameId: string;
  id?: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
  isWorkflowPage?: boolean;
}): GeneratedUIShape => ({
  id: p.id ?? nanoid(),
  type: "generatedui",
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
  uiSpecData: p.uiSpecData,
  sourceFrameId: p.sourceFrameId,
  isWorkflowPage: p.isWorkflowPage,
  stroke: "transparent",
  strokeWidth: 0,
  fill: p.fill ?? null,
});

/* ======================================================
   Shapes Slice
====================================================== */
const shapesSlice = createSlice({
  name: "shapes",
  initialState,
  reducers: {
    setTool(state, action: PayloadAction<Tool>) {
      state.tool = action.payload;
      if (action.payload !== "select") {
        state.selected = {};
      }
    },

    // Add shapes
    addFrame(
      state,
      action: PayloadAction<Omit<Parameters<typeof makeFrame>[0], "frameNumber">>
    ) {
      state.frameCounter += 1;
      const frameWithNumber = {
        ...action.payload,
        frameNumber: state.frameCounter,
      };
      shapesAdapter.addOne(state.shapes, makeFrame(frameWithNumber));
    },

    addRect(state, action: PayloadAction<Parameters<typeof makeRect>[0]>) {
      const shape = makeRect(action.payload);
      shapesAdapter.addOne(state.shapes, shape);
      state.selected = { [shape.id]: true };
    },

    addEllipse(state, action: PayloadAction<Parameters<typeof makeEllipse>[0]>) {
      const shape = makeEllipse(action.payload);
      shapesAdapter.addOne(state.shapes, shape);
      state.selected = { [shape.id]: true };
    },

    addArrow(state, action: PayloadAction<Parameters<typeof makeArrow>[0]>) {
      const shape = makeArrow(action.payload);
      shapesAdapter.addOne(state.shapes, shape);
      state.selected = { [shape.id]: true };
    },

    addLine(state, action: PayloadAction<Parameters<typeof makeLine>[0]>) {
      const shape = makeLine(action.payload);
      shapesAdapter.addOne(state.shapes, shape);
      state.selected = { [shape.id]: true };
    },

    addText(state, action: PayloadAction<Parameters<typeof makeText>[0]>) {
      const shape = makeText(action.payload);
      shapesAdapter.addOne(state.shapes, shape);
      state.selected = { [shape.id]: true };
    },

    addGeneratedUI(
      state,
      action: PayloadAction<Parameters<typeof makeGeneratedUI>[0]>
    ) {
      shapesAdapter.addOne(state.shapes, makeGeneratedUI(action.payload));
    },

    // Free draw
    startFreeDraw(state, action: PayloadAction<{ x: number; y: number }>) {
      const shape = makeFree({ points: [action.payload] });
      shapesAdapter.addOne(state.shapes, shape);
      state.isDrawing = true;
      state.currentDrawingId = shape.id;
    },

    continueFreeDraw(state, action: PayloadAction<Point>) {
      if (state.currentDrawingId && state.isDrawing) {
        const shape = state.shapes.entities[state.currentDrawingId] as FreeDrawShape;
        if (shape && shape.type === "freedraw") {
          shape.points.push(action.payload);
        }
      }
    },

    endFreeDraw(state) {
      state.isDrawing = false;
      if (state.currentDrawingId) {
        state.selected = { [state.currentDrawingId]: true };
      }
      state.currentDrawingId = null;
    },

    addFreeDrawShape(state, action: PayloadAction<Parameters<typeof makeFree>[0]>) {
      const { points } = action.payload;
      if (!points || points.length === 0) return;
      shapesAdapter.addOne(state.shapes, makeFree(action.payload));
    },

    // Update shapes
    updateShape(
      state,
      action: PayloadAction<{ id: string; patch: Partial<Shape> }>
    ) {
      const { id, patch } = action.payload;
      shapesAdapter.updateOne(state.shapes, { id, changes: patch });
    },

    moveShape(
      state,
      action: PayloadAction<{ id: string; x: number; y: number }>
    ) {
      const shape = state.shapes.entities[action.payload.id];
      if (shape && "x" in shape && "y" in shape) {
        shapesAdapter.updateOne(state.shapes, {
          id: action.payload.id,
          changes: { x: action.payload.x, y: action.payload.y },
        });
      }
    },

    resizeShape(
      state,
      action: PayloadAction<{
        id: string;
        w: number;
        h: number;
        x?: number;
        y?: number;
      }>
    ) {
      const { id, w, h, x, y } = action.payload;
      const changes: Partial<Shape> = { w, h } as any;
      if (x !== undefined) (changes as any).x = x;
      if (y !== undefined) (changes as any).y = y;
      shapesAdapter.updateOne(state.shapes, { id, changes });
    },

    // Delete shapes
    removeShape(state, action: PayloadAction<string>) {
      const id = action.payload;
      const shape = state.shapes.entities[id];
      if (shape?.type === "frame") {
        state.frameCounter = Math.max(0, state.frameCounter - 1);
      }
      shapesAdapter.removeOne(state.shapes, id);
      delete state.selected[id];
    },

    deleteSelected(state) {
      const ids = Object.keys(state.selected);
      if (ids.length) {
        shapesAdapter.removeMany(state.shapes, ids);
      }
      state.selected = {};
    },

    clearAll(state) {
      shapesAdapter.removeAll(state.shapes);
      state.selected = {};
      state.frameCounter = 0;
    },

    // Selection
    selectShape(state, action: PayloadAction<string>) {
      state.selected = { [action.payload]: true };
    },

    addToSelection(state, action: PayloadAction<string>) {
      state.selected[action.payload] = true;
    },

    deselectShape(state, action: PayloadAction<string>) {
      delete state.selected[action.payload];
    },

    clearSelection(state) {
      state.selected = {};
    },

    selectAll(state) {
      const ids = state.shapes.ids as string[];
      state.selected = Object.fromEntries(ids.map((id) => [id, true]));
    },

    // Load project data
    loadProject(
      state,
      action: PayloadAction<{
        shapes: EntityState<Shape, string>;
        tool?: Tool;
        selected?: SelectionMap;
        frameCounter?: number;
      }>
    ) {
      state.shapes = action.payload.shapes;
      state.tool = action.payload.tool ?? "select";
      state.selected = action.payload.selected ?? {};
      state.frameCounter = action.payload.frameCounter ?? 0;
    },

    // Reset to initial state
    resetShapes(state) {
      state.shapes = shapesAdapter.getInitialState();
      state.tool = "select";
      state.selected = {};
      state.frameCounter = 0;
      state.isDrawing = false;
      state.currentDrawingId = null;
    },
  },
});

export const {
  setTool,
  addFrame,
  addRect,
  addEllipse,
  addArrow,
  addLine,
  addText,
  addGeneratedUI,
  startFreeDraw,
  continueFreeDraw,
  endFreeDraw,
  addFreeDrawShape,
  updateShape,
  moveShape,
  resizeShape,
  removeShape,
  deleteSelected,
  clearAll,
  selectShape,
  addToSelection,
  deselectShape,
  clearSelection,
  selectAll,
  loadProject,
  resetShapes,
} = shapesSlice.actions;

export default shapesSlice.reducer;

// Selectors
export const shapesSelectors = shapesAdapter.getSelectors();