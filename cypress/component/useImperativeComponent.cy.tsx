/* eslint-disable react/prop-types,react/display-name */
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { createElement, useState } from "react";

import type { OutletRenderer } from "../../src/lib/use-imperative-component/useImperativeComponent";
import { createImperative } from "../../src/lib/use-imperative-component/useImperativeComponent";
import { createNamedFunctions } from "../../src/lib/namedFunctions";
import { ComponentStore } from "../../src/lib/use-imperative-component/ComponentStore";

describe("useImperativeComponent", () => {
  let App: ReturnType<typeof createTestApp>;
  beforeEach(() => {
    App = createTestApp();
  });

  describe("core behaviors", () => {
    it("mount does not create instance", () => {
      cy.mount(<App />);
      $.dialog().should("not.exist");
    });

    it("trigger creates instance", () => {
      cy.mount(<App />);
      $.trigger().click();
      $.dialog().should("exist");
    });

    it("instance can be given input", () => {
      cy.mount(<App input={() => "foo"} />);
      $.trigger().click();
      $.dialog("foo").should("exist");
    });

    describe("props", () => {
      it("instance can use default props", () => {
        cy.mount(<App defaultProps={{ prop: "default" }} />);
        $.trigger().click();
        $.prop().should("have.text", "default");
      });

      it("instance can use own props", () => {
        cy.mount(<App props={() => ({ prop: "own" })} />);
        $.trigger().click();
        $.prop().should("have.text", "own");
      });

      it("instance own props override default props", () => {
        cy.mount(
          <App
            props={() => ({ prop: "own" })}
            defaultProps={{ prop: "default" }}
          />
        );
        $.trigger().click();
        $.prop().should("have.text", "own");
      });
    });

    it("resolve returns value", () => {
      cy.mount(<App />);
      $.trigger().click();
      $.dialog().within(() => {
        $.response().type("value");
        $.resolve().click();
      });
      $.result().should("have.text", formatResult({ value: "value" }));
    });

    it("reject returns error", () => {
      cy.mount(<App />);
      $.trigger().click();
      $.dialog().within(() => {
        $.response().type("error");
        $.reject().click();
      });
      $.result().should("have.text", formatResult({ error: "error" }));
    });

    it("can have multiple instances", () => {
      cy.mount(<App />);
      $.trigger().click();
      $.trigger().click();
      $.dialog().should("have.length", 2);
    });

    it("multiple instances can have separate input", () => {
      let count = 0;
      cy.mount(<App input={() => count++} />);
      $.trigger().click();
      $.trigger().click();
      $.dialog("0").should("exist");
      $.dialog("1").should("exist");
    });

    it("instances are rendered in the order they are created", () => {
      let count = 0;
      cy.mount(<App input={() => count++} />);
      $.trigger().click();
      $.trigger().click();
      $.dialog().eq(0).should("have.attr", "aria-label", "0");
      $.dialog().eq(1).should("have.attr", "aria-label", "1");
    });
  });

  describe("persisted instances", () => {
    it("unmounting a component with pending instances does not remove its instances", () => {
      cy.mount(<App />);
      $.trigger().click();
      $.trigger().click();
      $.trigger().click();
      $.unmount().click();
      $.dialog().should("have.length", 3);
    });

    it("removes unmounted component from state once the final related instance is removed", () => {
      const store = new ComponentStore();
      App = createTestApp(
        createImperative({
          defaultStore: store,
          renderer: ImperativeOutlet,
        })
      );

      cy.mount(<App />);
      $.trigger().click();
      $.trigger().click();

      $.unmount().click();
      $.dialog()
        .should("have.length", 2)
        .then(() => expectComponentCount(1));

      $.remove().first().click();
      $.dialog()
        .should("have.length", 1)
        .then(() => expectComponentCount(1));

      $.remove().first().click();
      $.dialog()
        .should("have.length", 0)
        .then(() => expectComponentCount(0));

      function expectComponentCount(n: number) {
        expect(Object.keys(store.state).length).to.equal(n);
      }
    });
  });

  describe("auto removal of instances", () => {
    beforeEach(() => {
      App = createTestApp(
        createImperative({
          renderer: ImperativeOutlet,
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
  });

  describe("when auto removal of instances is disabled", () => {
    beforeEach(() => {
      App = createTestApp(
        createImperative({
          renderer: ImperativeOutlet,
          autoRemoveInstances: false,
        })
      );
    });
    it("resolving does not remove instance", () => {
      cy.mount(<App />);
      $.trigger().click();
      $.resolve().click();
      $.dialog().should("exist");
    });

    it("rejecting does not remove instance", () => {
      cy.mount(<App />);
      $.trigger().click();
      $.reject().click();
      $.dialog().should("exist");
    });
  });

  describe("manual removal of instances", () => {
    it("can manually remove instance", () => {
      cy.mount(<App />);
      $.trigger().click();
      $.remove().click();
      $.dialog().should("not.exist");
    });

    it("manually removing one of many instances removes the right instance", () => {
      let count = 0;
      cy.mount(<App input={() => count++} />);
      $.trigger().click();
      $.trigger().click();
      $.dialog("0").within(() => $.remove().click());
      $.dialog("1").should("exist");
    });
  });
});

function createTestApp(
  { Outlet, useComponent } = createImperative({ renderer: ImperativeOutlet })
) {
  return function App({
    children,
    ...props
  }: ComponentProps<typeof Mount> & {
    children?: (renderMount: ComponentType) => ReactNode;
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

  function HookConsumer({
    input,
    props,
    defaultProps,
  }: {
    input?: () => unknown;
    props?: () => Record<string, unknown>;
    defaultProps?: Record<string, unknown>;
  }) {
    const [result, setResult] = useState();
    const trigger = useComponent(Dialog, defaultProps);
    return (
      <>
        {result && (
          <div data-testid={$.result.name}>{formatResult(result)}</div>
        )}
        <button onClick={() => trigger(input?.(), props?.()).then(setResult)}>
          trigger
        </button>
      </>
    );
  }
}

function Dialog({ resolve, reject, remove, input, prop }) {
  const [response, setResponse] = useState("");
  return (
    <div role="dialog" aria-label={input}>
      <input
        aria-label={$.response.name}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
      />
      <div data-testid={$.prop.name}>{prop}</div>
      <button onClick={() => resolve(response)}>{$.resolve.name}</button>
      <button onClick={() => reject(response)}>{$.reject.name}</button>
      <button onClick={() => remove()}>{$.remove.name}</button>
    </div>
  );
}

function ImperativeOutlet({ entries }: ComponentProps<OutletRenderer>) {
  return (
    <>
      {entries.map(
        ({ component, defaultProps, props, state, key, ...builtins }) =>
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
  .add("result", cy.findByTestId)
  .add("trigger", roleByName("button"))
  .add("prop", cy.findByTestId)
  .build();

function roleByName<Role extends string>(role: Role) {
  return (name: string) => cy.findAllByRole(role, { name });
}
