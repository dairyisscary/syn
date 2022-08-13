import { For, Show, createSignal, createEffect, onCleanup } from "solid-js";
import type { WebrtcProvider } from "y-webrtc";

type LocalUser = {
  name: string;
  joinedOn: number;
};
type Position = { top: number; left: number };
type RemoteUser = LocalUser & {
  cursor?: Position;
};
type Props = {
  onLogin: (name: string) => void;
  remoteUsers: RemoteUser[];
  localUser?: LocalUser | null;
};

function usersFromAwareness(awareness: WebrtcProvider["awareness"]) {
  const { clientID } = awareness;
  return {
    getLocalUser: () => {
      const local = awareness.getLocalState();
      return local?.name ? (local as LocalUser) : null;
    },
    getRemoteUsers: () =>
      Array.from(awareness.getStates().entries())
        .flatMap(([key, value]) =>
          key !== clientID && value.name ? [value as RemoteUser] : []
        )
        .sort((a, b) => a.joinedOn - b.joinedOn),
  };
}

export function createAwarenessUsers({ awareness }: WebrtcProvider) {
  const { getLocalUser, getRemoteUsers } = usersFromAwareness(awareness);
  const [localUser, setLocalUser] = createSignal<LocalUser | null>(
    getLocalUser()
  );
  const [remoteUsers, setRemoteUsers] = createSignal<RemoteUser[]>(
    getRemoteUsers()
  );
  createEffect(() => {
    const handler = (
      _changes: unknown[],
      event: "local" | Record<string, unknown>
    ) => {
      if (event === "local") {
        setLocalUser(getLocalUser());
      } else {
        setRemoteUsers(getRemoteUsers());
      }
    };
    awareness.on("change", handler);
    onCleanup(() => awareness.off("change", handler));
  });
  return {
    localUser,
    remoteUsers,
    handleCursorPositionChange(newPosition: Position) {
      awareness.setLocalStateField("cursor", newPosition);
    },
    handleLogin(name: string) {
      awareness.setLocalState({
        ...awareness.getLocalState(),
        name,
        joinedOn: Date.now(),
      });
    },
  };
}

function OnlineAside(props: Props) {
  return (
    <aside class="flex flex-col gap-4 py-4 px-3 w-2/12 bg-rp-surface">
      <h1 class="text-3xl font-bold">Who's online?</h1>
      <Show when={!props.localUser}>
        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            const data = new FormData(evt.target as HTMLFormElement);
            const username = data.get("username") as string;
            props.onLogin(username);
          }}
        >
          <label for="login-username" class="block mb-2 font-semibold">
            Username
          </label>
          <input
            type="text"
            class="block mb-2 py-2 px-3 bg-rp-overlay rounded"
            id="login-username"
            name="username"
            required
          />
          <button type="submit">Login</button>
        </form>
      </Show>
      <ul class="flex-1 list-disc list-inside overflow-y-auto">
        <Show when={props.localUser}>
          {(localUser) => (
            <li>
              {localUser.name}
              <span class="italic"> (you)</span>
            </li>
          )}
        </Show>
        <For each={props.remoteUsers}>{(user) => <li>{user.name}</li>}</For>
      </ul>
    </aside>
  );
}

export default OnlineAside;
