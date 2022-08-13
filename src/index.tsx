import { render } from "solid-js/web";

import App from "./app";

const cleanup = render(App, document.getElementById("root")!);
if (import.meta.hot) {
  import.meta.hot.dispose(cleanup);
}
