import { createSignal, createEffect, onCleanup } from "solid-js";
import { Map as YMap, Array as YArray, type YMapEvent } from "yjs";

type MapSetters<R> = { [k in keyof R]: (newValue: R[k]) => void };
type MapGetters<R> = { [k in keyof R]: () => R[k] };

export function createSyncArray<T>(array: YArray<T>): () => T[] {
  const [arrayValue, setArrayValue] = createSignal<T[]>(array.toArray());
  createEffect(() => {
    const handler = () => setArrayValue(array.toArray());
    array.observe(handler);
    onCleanup(() => array.unobserve(handler));
  });
  return arrayValue;
}

export function createSyncMap<R extends Record<string, unknown>>(
  map: YMap<any>,
  keys: readonly (keyof R)[]
): MapGetters<R> {
  const getters = {} as MapGetters<R>;
  const setters = {} as MapSetters<R>;
  for (const key of keys) {
    const [getter, setter] = createSignal(map.get(key as string));
    setters[key] = setter;
    getters[key] = getter;
  }
  createEffect(() => {
    const handler = ({ changes }: YMapEvent<any>) => {
      changes.keys.forEach((change, key) => {
        setters[key](map.get(key));
      });
    };
    map.observe(handler);
    onCleanup(() => map.unobserve(handler));
  });
  return getters;
}
