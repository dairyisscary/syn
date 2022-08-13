import { createSignal } from "solid-js";
import { Doc, Map as YMap } from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";

import DrawArea from "./draw";
import { getRandomRPColorName } from "./color";
import OnlineAside, { createAwarenessUsers } from "./awareness";
import { createSyncArray } from "./sync";

type Position = { top: number; left: number };

type DraggingBoxPosition = {
  index: number;
  position: Position;
};

function createAppState() {
  const doc = new Doc();
  const networkProvider = new WebrtcProvider("syn-global-room", doc);
  new IndexeddbPersistence("syn-index-db", doc);

  const { localUser, remoteUsers, handleLogin, handleCursorPositionChange } =
    createAwarenessUsers(networkProvider);
  const boxes = doc.getArray<YMap<any>>("boxes");
  const [draggingBoxPosition, setDraggingBoxPosition] =
    createSignal<null | DraggingBoxPosition>(null);
  return {
    localUser,
    remoteUsers,
    handleLogin,

    boxes: createSyncArray(boxes),
    isDragging: () => Boolean(draggingBoxPosition()),
    boxCursorDown: (newDraggingPostion: DraggingBoxPosition) => {
      if (localUser()) {
        setDraggingBoxPosition(newDraggingPostion);
      }
    },
    moveCursor(newPosition: Position) {
      handleCursorPositionChange(newPosition);
      if (!localUser()) {
        return;
      }
      const draggingPos = draggingBoxPosition();
      if (!draggingPos) {
        return;
      }
      const { index, position } = draggingPos;
      const box = boxes.get(index);
      const boxPosition = box.get("position");
      box.set("position", {
        top: boxPosition.top + newPosition.top - position.top,
        left: boxPosition.left + newPosition.left - position.left,
      });
      setDraggingBoxPosition({ index, position: newPosition });
    },
    releaseCursor(position: Position) {
      if (!localUser()) {
        return;
      } else if (draggingBoxPosition()) {
        return setDraggingBoxPosition(null);
      }
      boxes.push([
        new YMap([
          ["position" as const, position],
          ["size" as const, { width: 100, height: 100 }],
          ["color" as const, getRandomRPColorName()],
        ]),
      ]);
    },
  };
}

function App() {
  const state = createAppState();
  return (
    <div class="flex items-stretch h-screen">
      <DrawArea
        onMoveCursor={state.moveCursor}
        onDrawPointerUp={state.releaseCursor}
        onBoxPointerDown={state.boxCursorDown}
        boxes={state.boxes()}
        remoteUsers={state.remoteUsers()}
        dragState={
          state.isDragging() ? "dragging" : state.localUser() ? "ready" : "none"
        }
      />
      <OnlineAside
        onLogin={state.handleLogin}
        remoteUsers={state.remoteUsers()}
        localUser={state.localUser()}
      />
    </div>
  );
}

export default App;
