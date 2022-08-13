import { For } from "solid-js";
import type { Map as YMap } from "yjs";

import { createSyncMap } from "../sync";
import {
  type RPColor,
  getRPColorFromName,
  getRPColorFromIndex,
} from "../color";

type Position = { top: number; left: number };
type Size = { width: number; height: number };
type DrawableBox = {
  position: Position;
  size: Size;
  color: RPColor;
};
type Props = {
  boxes: YMap<any>[];
  remoteUsers: { name: string; cursor?: Position }[];
  onMoveCursor: (newPosition: Position) => void;
  onDrawPointerUp: (position: Position) => void;
  onBoxPointerDown: (data: { index: number; position: Position }) => void;
  dragState: "none" | "ready" | "dragging";
};

function Box(props: {
  onPointerDown: (evt: PointerEvent) => void;
  dragState: Props["dragState"];
  box: YMap<any>;
}) {
  const { size, position, color } = createSyncMap<DrawableBox>(props.box, [
    "size",
    "position",
    "color",
  ]);
  return (
    <div
      class="absolute rounded top-0 left-0 border border-base"
      onPointerDown={props.onPointerDown}
      style={{
        cursor:
          props.dragState === "dragging"
            ? "grabbing"
            : props.dragState === "ready"
            ? "grab"
            : undefined,
        "background-color": getRPColorFromName(color()),
        width: `${size().width}px`,
        height: `${size().height}px`,
        transform: `translate(${position().left}px, ${position().top}px)`,
      }}
    />
  );
}

function Cursor(props: { name: string; index: number; position?: Position }) {
  return (
    <div
      class="absolute w-5 h-5 top-0 left-0 pointer-events-none"
      style={
        props.position
          ? {
              transform: `translate(${props.position.left}px, ${props.position.top}px)`,
            }
          : { display: "none" }
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="-rotate-45 drop-shadow"
        viewBox="0 0 32 32"
      >
        <path
          class="stroke-base"
          style={{ fill: getRPColorFromIndex(props.index) }}
          d="M25,30a5.82,5.82,0,0,1-1.09-.17l-.2-.07-7.36-3.48a.72.72,0,0,0-.35-.08.78.78,0,0,0-.33.07L8.24,29.54a.66.66,0,0,1-.2.06,5.17,5.17,0,0,1-1,.15,3.6,3.6,0,0,1-3.29-5L12.68,4.2a3.59,3.59,0,0,1,6.58,0l9,20.74A3.6,3.6,0,0,1,25,30Z"
        />
      </svg>
      <span class="p-1 text-sm drop-shadow">{props.name}</span>
    </div>
  );
}

function DrawArea(props: Props) {
  return (
    <main
      id="draw-area"
      class={`flex-1 relative select-none overflow-hidden bg-left-top ${
        props.dragState === "dragging"
          ? "cursor-grabbing"
          : props.dragState === "ready"
          ? "cursor-pointer"
          : ""
      }`}
      onPointerMove={(event) => {
        props.onMoveCursor({ top: event.clientY, left: event.clientX });
      }}
      onPointerUp={(event) => {
        props.onDrawPointerUp({ top: event.clientY, left: event.clientX });
      }}
    >
      <For each={props.boxes}>
        {(box, index) => (
          <Box
            box={box}
            dragState={props.dragState}
            onPointerDown={(evt) => {
              props.onBoxPointerDown({
                index: index(),
                position: { left: evt.clientX, top: evt.clientY },
              });
            }}
          />
        )}
      </For>
      <For each={props.remoteUsers}>
        {(user, index) => (
          <Cursor index={index()} name={user.name} position={user.cursor} />
        )}
      </For>
    </main>
  );
}

export default DrawArea;
