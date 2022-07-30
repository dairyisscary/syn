import { render } from "solid-js/web";

function App() {
  return <div>hibro</div>;
}

const cleanup = render(App, document.getElementById("root")!);
if (import.meta.hot) {
  import.meta.hot.dispose(cleanup);
}
