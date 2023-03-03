/* eslint-disable react/prop-types,react/display-name */
import type { ComponentProps, ReactNode } from "react";
import { createElement, useRef, useState } from "react";

import type {
  OutletEntry,
  OutletRenderer,
} from "../../src/lib/use-imperative-component/useImperativeComponent";
import { createImperative } from "../../src/lib/use-imperative-component/useImperativeComponent";
import { createNamedFunctions } from "../../src/lib/namedFunctions";

describe("useImperativeComponent", () => {
  describe("core behaviors", () => {
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
  });

  describe("auto removal of components", () => {
    let App: ReturnType<typeof createTestApp>;
    beforeEach(() => {
      App = createTestApp(
        createImperative({
          renderer: outletRenderer(),
          autoRemoveComponents: true,
        })
      );
    });

    it("unmounting a component removes all its instances", () => {
      cy.mount(<App />);
      $.trigger().click();
      $.trigger().click();
      $.trigger().click();
      $.unmount().click();
      $.dialog().should("not.exist");
    });
  });

  describe("auto removal of instances", () => {
    let App: ReturnType<typeof createTestApp>;
    beforeEach(() => {
      App = createTestApp(
        createImperative({
          renderer: outletRenderer(),
          autoRemoveInstances: true,
        })
      );
    });

    it("resolving a lone instance removes it", () => {
      cy.mount(<App />);
      $.trigger().click();
      $.resolve().click();
      $.dialog().should("not.exist");
    });

    it("rejecting a lone instance removes it", () => {
      cy.mount(<App />);
      $.trigger().click();
      $.reject().click();
      $.dialog().should("not.exist");
    });

    it("resolving one of many instances removes the right instance", () => {
      let count = 0;
      cy.mount(<App input={() => count++} />);
      $.trigger().click();
      $.trigger().click();
      $.dialog("0").within(() => $.resolve().click());
      $.dialog("1").should("exist");
    });

    it("rejecting one of many instances removes the right instance", () => {
      let count = 0;
      cy.mount(<App input={() => count++} />);
      $.trigger().click();
      $.trigger().click();
      $.dialog("0").within(() => $.reject().click());
      $.dialog("1").should("exist");
    });

    it("resolving while opted out does not remove instance", () => {
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

    it("rejecting while opted out does not remove instance", () => {
      const App = createTestApp(
        createImperative({
          renderer: outletRenderer(),
          autoRemoveInstances: false,
        })
      );
      cy.mount(<App />);
      $.trigger().click();
      $.reject().click();
      $.dialog().should("exist");
    });
  });

  describe("manual removal of instances", () => {
    it("can manually remove instance", () => {
      const App = createTestApp();
      cy.mount(<App />);
      $.trigger().click();
      $.remove().click();
      $.dialog().should("not.exist");
    });

    it("manually removing one of many instances removes the right instance", () => {
      let count = 0;
      const App = createTestApp();
      cy.mount(<App input={() => count++} />);
      $.trigger().click();
      $.trigger().click();
      $.dialog("0").within(() => $.remove().click());
      $.dialog("1").should("exist");
    });
  });
});

function createTestApp(
  { Outlet, useComponent } = createImperative({ renderer: outletRenderer() })
) {
  return function App({
    children,
    ...props
  }: ComponentProps<typeof Mount> & {
    children?: (renderMount: () => ReactNode) => ReactNode;
  }) {
    const renderMount = () => <Mount {...props} />;
    return (
      <>
        {children !== undefined ? children(renderMount) : renderMount()}
        <Outlet />
      </>
    );
  };

  function Mount(props: ComponentProps<typeof HookConsumer>) {
    const [isMounted, setMounted] = useState(true);
    return (
      <>
        {isMounted && <HookConsumer {...props} />}
        <button onClick={() => setMounted(false)}>{$.unmount.name}</button>
      </>
    );
  }

  function HookConsumer({ input }: { input?: () => unknown }) {
    const [result, setResult] = useState();
    const trigger = useComponent(Dialog);
    return (
      <>
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

const $ = createNamedFunctions()
  .add("dialog", (role, name?: string) => cy.findAllByRole(role, { name }))
  .add("resolve", roleByName("button"))
  .add("reject", roleByName("button"))
  .add("remove", roleByName("button"))
  .add("unmount", roleByName("button"))
  .add("response", roleByName("textbox"))
  .add("result", (id) => cy.findByTestId(id))
  .add("trigger", roleByName("button"))
  .build();

function roleByName<Role extends string>(role: Role) {
  return (name: string) => cy.findAllByRole(role, { name });
}
