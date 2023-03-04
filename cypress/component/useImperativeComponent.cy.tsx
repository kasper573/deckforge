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

  it("mount does not create instance", () => {
    cy.mount(<App />);
    $.dialog().should("not.exist");
  });

  it("trigger creates instance", () => {
    cy.mount(<App />);
    $.trigger().click();
    $.dialog().should("exist");
  });

  it("instance component can be changed", () => {
    const imp = createImperative(ImperativeOutlet);
    cy.mount(<App />);
    cy.findByText("trigger").click();
    cy.findByText("Component1").should("exist");
    cy.findByText("Component2").should("not.exist");

    cy.findByText("change").click();
    cy.findByText("Component1").should("not.exist");
    cy.findByText("Component2").should("exist");

    function App() {
      const [component, setComponent] = useState(() => Component1);
      const trigger = imp.useComponent(component);
      return (
        <>
          <button onClick={() => trigger()}>trigger</button>
          <button onClick={() => setComponent(() => Component2)}>change</button>
          <imp.Outlet />
        </>
      );
    }

    function Component1() {
      return <div>Component1</div>;
    }
    function Component2() {
      return <div>Component2</div>;
    }
  });

  it("resolve returns value", () => {
    cy.mount(<App />);
    $.trigger().click();
    $.dialog().within(() => {
      $.response().type("value");
      $.resolve().click();
    });
    $.result().should("have.text", "value");
  });

  it("can have multiple instances", () => {
    cy.mount(<App />);
    $.trigger().click();
    $.trigger().click();
    $.dialog().should("have.length", 2);
  });

  it("instances are rendered in the order they are created", () => {
    let count = 0;
    cy.mount(<App props={() => ({ name: count++ })} />);
    $.trigger().click();
    $.trigger().click();
    $.dialog().eq(0).should("have.attr", "aria-label", "0");
    $.dialog().eq(1).should("have.attr", "aria-label", "1");
  });

  describe("properties", () => {
    it("instance can use default props", () => {
      cy.mount(<App defaultProps={{ prop: "default" }} />);
      $.trigger().click();
      $.prop().should("have.text", "default");
    });

    it("instance can receive changed default props", () => {
      cy.mount(<AppWithChanges />);
      $.trigger().click();
      cy.findByText("change").click();
      $.prop().should("have.text", "changed");

      function AppWithChanges() {
        const [prop, setProp] = useState("default");
        return (
          <>
            <App defaultProps={{ prop }} />
            <button onClick={() => setProp("changed")}>change</button>
          </>
        );
      }
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

    it("multiple instances can have separate props", () => {
      let count = 0;
      cy.mount(<App props={() => ({ name: count++ })} />);
      $.trigger().click();
      $.trigger().click();
      $.dialog("0").should("exist");
      $.dialog("1").should("exist");
    });
  });

  describe("lifecycles", () => {
    it("unmounting a component with pending instances does not remove its instances", () => {
      cy.mount(<App />);
      $.trigger().click();
      $.trigger().click();
      $.trigger().click();
      $.unmount().click();
      $.dialog().should("have.length", 3);
    });

    it("removes unmounted component from state once the final related instance is removed", () => {
      const imp = createImperative(ImperativeOutlet);
      const store = new ComponentStore();
      App = createTestApp(imp);

      cy.mount(
        <imp.Context.Provider value={store}>
          <App />
        </imp.Context.Provider>
      );
      $.trigger().click();
      $.trigger().click();

      $.unmount().click();
      $.dialog()
        .should("have.length", 2)
        .then(() => expectComponentCount(1));

      $.resolve().first().click();
      $.dialog()
        .should("have.length", 1)
        .then(() => expectComponentCount(1));

      $.resolve().first().click();
      $.dialog()
        .should("have.length", 0)
        .then(() => expectComponentCount(0));

      function expectComponentCount(n: number) {
        expect(Object.keys(store.state).length).to.equal(n);
      }
    });

    it("resolving a lone instance removes it", () => {
      cy.mount(<App />);
      $.trigger().click();
      $.resolve().click();
      $.dialog().should("not.exist");
    });

    it("resolving one of many instances removes the right instance", () => {
      let count = 0;
      cy.mount(<App props={() => ({ name: count++ })} />);
      $.trigger().click();
      $.trigger().click();
      $.dialog("0").within(() => $.resolve().click());
      $.dialog("1").should("exist");
    });

    it("can delay removal when resolving", async () => {
      let resolveDelay = () => {};
      const delayPromise = new Promise<void>((r) => (resolveDelay = r));
      cy.mount(<App defaultProps={{ delayPromise }} />);

      // Open and resolve dialog immediately
      $.trigger().click();
      $.resolve().click();

      // Confirm that the dialog is still present after resolve
      cy.wait(100);
      $.dialog()
        .should("exist")

        // End the delay and confirm that it removes the dialog
        .then(resolveDelay)
        .then(() => $.dialog().should("not.exist"));
    });
  });
});

function createTestApp(
  { Outlet, useComponent } = createImperative(ImperativeOutlet)
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
    props,
    defaultProps,
  }: {
    props?: () => Record<string, unknown>;
    defaultProps?: Record<string, unknown>;
  }) {
    const [result, setResult] = useState();
    const trigger = useComponent(Dialog, defaultProps);
    return (
      <>
        {result && <div data-testid={$.result.name}>{result}</div>}
        <button onClick={() => trigger(props?.()).then(setResult)}>
          trigger
        </button>
      </>
    );
  }
}

function Dialog({ resolve, name, prop, delayPromise }) {
  const [response, setResponse] = useState("");
  return (
    <div role="dialog" aria-label={name}>
      <input
        aria-label={$.response.name}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
      />
      <div data-testid={$.prop.name}>{prop}</div>
      <button onClick={() => resolve(response, delayPromise)}>
        {$.resolve.name}
      </button>
    </div>
  );
}

function ImperativeOutlet({ entries }: ComponentProps<OutletRenderer>) {
  return (
    <>
      {entries.map(({ component, defaultProps, props, ...builtins }) =>
        createElement(component, {
          ...defaultProps,
          ...props,
          ...builtins,
        })
      )}
    </>
  );
}

const $ = createNamedFunctions()
  .add("dialog", (role, name?: string) => cy.findAllByRole(role, { name }))
  .add("resolve", roleByName("button"))
  .add("unmount", roleByName("button"))
  .add("response", roleByName("textbox"))
  .add("result", cy.findByTestId)
  .add("trigger", roleByName("button"))
  .add("prop", cy.findByTestId)
  .build();

function roleByName<Role extends string>(role: Role) {
  return (name: string) => cy.findAllByRole(role, { name });
}
