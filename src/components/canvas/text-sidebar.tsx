"use client";

import { useAppSelector, useAppDispatch } from "@/redux/store";
import { updateShape, TextShape } from "@/redux/slice/shapes";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

const fontFamilies = [
  "Inter, sans-serif",
  "Arial, sans-serif",
  "Helvetica, sans-serif",
  "Georgia, serif",
  "Times New Roman, serif",
  "Courier New, monospace",
  "Verdana, sans-serif",
];

interface TextSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function TextSidebar({ isOpen, onClose }: TextSidebarProps) {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.shapes.selected);
  const entities = useAppSelector((state) => state.shapes.shapes.entities);

  const selectedIds = Object.keys(selected || {});
  const selectedTextShape = selectedIds
    .map((id) => entities[id])
    .find((shape) => shape?.type === "text") as TextShape | undefined;

  const updateTextProperty = (property: string, value: any) => {
    if (!selectedTextShape) return;
    dispatch(updateShape({ id: selectedTextShape.id, patch: { [property]: value } }));
  };

  if (!isOpen || !selectedTextShape) return null;

  return (
    <div
      className={cn(
        "fixed right-0 top-14 h-[calc(100vh-56px)] w-72 bg-background border-l shadow-lg z-40",
        "transform transition-transform duration-200",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Text Properties</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <Label>Text</Label>
          <Input
            value={selectedTextShape.text}
            onChange={(e) => updateTextProperty("text", e.target.value)}
            placeholder="Enter text..."
          />
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <Label>Font Family</Label>
          <Select
            value={selectedTextShape.fontFamily}
            onValueChange={(value) => updateTextProperty("fontFamily", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: font }}>{font.split(",")[0]}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <Label>Font Size: {selectedTextShape.fontSize}px</Label>
          <Slider
            value={[selectedTextShape.fontSize]}
            min={8}
            max={120}
            step={1}
            onValueChange={([value]) => updateTextProperty("fontSize", value)}
          />
        </div>

        {/* Font Weight */}
        <div className="space-y-2">
          <Label>Font Weight: {selectedTextShape.fontWeight}</Label>
          <Slider
            value={[selectedTextShape.fontWeight]}
            min={100}
            max={900}
            step={100}
            onValueChange={([value]) => updateTextProperty("fontWeight", value)}
          />
        </div>

        {/* Style Toggles */}
        <div className="space-y-2">
          <Label>Style</Label>
          <div className="flex gap-1">
            <Toggle
              pressed={selectedTextShape.fontWeight >= 700}
              onPressedChange={(pressed) =>
                updateTextProperty("fontWeight", pressed ? 700 : 400)
              }
              size="sm"
            >
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={selectedTextShape.fontStyle === "italic"}
              onPressedChange={(pressed) =>
                updateTextProperty("fontStyle", pressed ? "italic" : "normal")
              }
              size="sm"
            >
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={selectedTextShape.textDecoration === "underline"}
              onPressedChange={(pressed) =>
                updateTextProperty("textDecoration", pressed ? "underline" : "none")
              }
              size="sm"
            >
              <Underline className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={selectedTextShape.textDecoration === "line-through"}
              onPressedChange={(pressed) =>
                updateTextProperty("textDecoration", pressed ? "line-through" : "none")
              }
              size="sm"
            >
              <Strikethrough className="h-4 w-4" />
            </Toggle>
          </div>
        </div>

        {/* Text Align */}
        <div className="space-y-2">
          <Label>Alignment</Label>
          <div className="flex gap-1">
            <Toggle
              pressed={selectedTextShape.textAlign === "left"}
              onPressedChange={() => updateTextProperty("textAlign", "left")}
              size="sm"
            >
              <AlignLeft className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={selectedTextShape.textAlign === "center"}
              onPressedChange={() => updateTextProperty("textAlign", "center")}
              size="sm"
            >
              <AlignCenter className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={selectedTextShape.textAlign === "right"}
              onPressedChange={() => updateTextProperty("textAlign", "right")}
              size="sm"
            >
              <AlignRight className="h-4 w-4" />
            </Toggle>
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedTextShape.fill || "#ffffff"}
              onChange={(e) => updateTextProperty("fill", e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-0"
            />
            <Input
              value={selectedTextShape.fill || "#ffffff"}
              onChange={(e) => updateTextProperty("fill", e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}