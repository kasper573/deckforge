/* eslint-disable react/prop-types,react/display-name */
import type { ComponentProps } from "react";
import { createElement, useRef, useState } from "react";

import type {
  OutletEntry,
  OutletRenderer,
} from "../../src/lib/use-imperative-component/useImperativeComponent";
import { createImperative } from "../../src/lib/use-imperative-component/useImperativeComponent";
import { createFunctor } from "../../src/lib/functors";

describe("useImperativeComponent", () => {
  it("mount does not create instance", () => {
    const App = createTestApp();
    cy.mount(<App />);
    $.dialog().should("not.exist");
  });

  it("trigger creates instance", () => {
    const App = createTestApp();
    cy.mount(<App />);
    $.trigger().click();
    $.dialog().should("exist");
  });

  it("instance can be given input", () => {
    const App = createTestApp();
    cy.mount(<App input={() => "foo"} />);
    $.trigger().click();
    $.dialog("foo").should("exist");
  });

  it("resolve returns value", () => {
    const App = createTestApp();
    cy.mount(<App />);
    $.trigger().click();
    $.dialog().within(() => {
      $.response().type("value");
      $.resolve().click();
    });
    $.result().should("have.text", formatResult({ value: "value" }));
  });

  it("reject returns error", () => {
    const App = createTestApp();
    cy.mount(<App />);
    $.trigger().click();
    $.dialog().within(() => {
      $.response().type("error");
      $.reject().click();
    });
    $.result().should("have.text", formatResult({ error: "error" }));
  });

  it("resolve removes instance", () => {
    const App = createTestApp();
    cy.mount(<App />);
    $.trigger().click();
    $.resolve().click();
    $.dialog().should("not.exist");
  });

  it("reject removes instance", () => {
    const App = createTestApp();
    cy.mount(<App />);
    $.trigger().click();
    $.reject().click();
    $.dialog().should("not.exist");
  });

  it("can have multiple instances", () => {
    const App = createTestApp();
    cy.mount(<App />);
    $.trigger().click();
    $.trigger().click();
    $.dialog().should("have.length", 2);
  });

  it("multiple instances can have separate input", () => {
    let count = 0;
    const App = createTestApp();
    cy.mount(<App input={() => count++} />);
    $.trigger().click();
    $.trigger().click();
    $.dialog("0").should("exist");
    $.dialog("1").should("exist");
  });

  it("instances are rendered in the order they are created", () => {
    let count = 0;
    const App = createTestApp();
    cy.mount(<App input={() => count++} />);
    $.trigger().click();
    $.trigger().click();
    $.dialog().eq(0).should("have.attr", "aria-label", "0");
    $.dialog().eq(1).should("have.attr", "aria-label", "1");
  });

  it("can opt out of auto removing instances", () => {
    const App = createTestApp(
      createImperative({
        renderer: outletRenderer(),
        autoRemoveInstances: false,
      })
    );
    cy.mount(<App />);
    $.trigger().click();
    $.resolve().click();
    $.dialog().should("exist");
  });

  it("can manually remove instance", () => {
    const App = createTestApp();
    cy.mount(<App />);
    $.trigger().click();
    $.remove().click();
    $.dialog().should("not.exist");
  });
});

function createTestApp(
  { Outlet, useComponent } = createImperative({ renderer: outletRenderer() })
) {
  return function App(props: ComponentProps<typeof Page>) {
    return (
      <>
        <RenderCounter name={$.appRC.name} />
        <Page {...props} />
        <Outlet />
      </>
    );
  };

  function Page({ input }: { input?: () => unknown }) {
    const [result, setResult] = useState();
    const trigger = useComponent(Dialog);
    return (
      <>
        <RenderCounter name={$.pageRC.name} />
        {result && (
          <div data-testid={$.result.name}>{formatResult(result)}</div>
        )}
        <button onClick={() => trigger(input?.()).then(setResult)}>
          trigger
        </button>
      </>
    );
  }
}

function Dialog({ resolve, reject, remove, input }) {
  const [response, setResponse] = useState("");
  return (
    <div role="dialog" aria-label={input}>
      <input
        aria-label={$.response.name}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
      />
      <button onClick={() => resolve(response)}>{$.resolve.name}</button>
      <button onClick={() => reject(response)}>{$.reject.name}</button>
      <button onClick={() => remove()}>{$.remove.name}</button>
    </div>
  );
}

function RenderCounter({ name }: { name: string }) {
  const count = useRef(0);
  count.current++;
  return null;
  //return <div data-testid={name}>{count.current}</div>;
}

function outletRenderer(
  filterPredicate: (entry: OutletEntry) => boolean = () => true
): OutletRenderer {
  return ({ entries }) => (
    <>
      {entries
        .filter(filterPredicate)
        .map(({ component, defaultProps, props, state, key, ...builtins }) =>
          createElement(component, {
            key,
            ...defaultProps,
            ...props,
            ...builtins,
          })
        )}
    </>
  );
}

const formatResult = (r: unknown) => JSON.stringify(r);

const $ = {
  dialog: createFunctor("dialog", (role, name?: string) =>
    cy.findAllByRole(role, { name })
  ),
  resolve: createFunctor("resolve", roleByName("button")),
  reject: createFunctor("reject", roleByName("button")),
  remove: createFunctor("remove", roleByName("button")),
  response: createFunctor("input", roleByName("textbox")),
  result: createFunctor("result", (id) => cy.findByTestId(id)),
  trigger: createFunctor("trigger", roleByName("button")),
  appRC: createFunctor("app-render-count", (id) => cy.findAllByTestId(id)),
  pageRC: createFunctor("page-render-count", (id) => cy.findAllByTestId(id)),
};

function roleByName<Role extends string>(role: Role) {
  return (name: string) => cy.findAllByRole(role, { name });
}
