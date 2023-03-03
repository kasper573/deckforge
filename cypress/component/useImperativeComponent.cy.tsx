import type { ComponentProps } from "react";
import { useRef, useState } from "react";
import { createImperative } from "../../src/lib/use-imperative-component/useImperativeComponent";

describe("useImperativeComponent", () => {
  it("mount does not create instance", () => {
    cy.mount(<App />);
    $.dialog.target.should("not.exist");
  });

  it("trigger creates instance", () => {
    cy.mount(<App />);
    $.trigger.target.click();
    $.dialog.target.should("exist");
  });

  it("resolve returns value", () => {
    cy.mount(<App />);
    $.trigger.target.click();
    $.dialog.target.within(() => {
      $.response.target.type("value");
      $.resolve.target.click();
    });
    $.result.target.should(
      "have.text",
      formatResult({ type: "success", value: "value" })
    );
  });

  it("reject returns error", () => {
    cy.mount(<App />);
    $.trigger.target.click();
    $.dialog.target.within(() => {
      $.response.target.type("error");
      $.reject.target.click();
    });
    $.result.target.should(
      "have.text",
      formatResult({ type: "error", error: "error" })
    );
  });

  it("resolve removes instance", () => {
    cy.mount(<App />);
    $.trigger.target.click();
    $.resolve.target.click();
    $.dialog.target.should("not.exist");
  });

  it("reject removes instance", () => {
    cy.mount(<App />);
    $.trigger.target.click();
    $.reject.target.click();
    $.dialog.target.should("not.exist");
  });
});

const { Outlet, useComponent } = createImperative();

function App(props: ComponentProps<typeof Page>) {
  return (
    <>
      <RenderCounter name={$.appRC.name} />
      <Page {...props} />
      <Outlet />
    </>
  );
}

function Page({ input }: { input?: () => unknown }) {
  const [result, setResult] = useState();
  const trigger = useComponent(Dialog);
  return (
    <>
      <RenderCounter name={$.pageRC.name} />
      {result && <div data-testid={$.result.name}>{formatResult(result)}</div>}
      <button onClick={() => trigger(input?.()).then(setResult)}>
        trigger
      </button>
    </>
  );
}

function Dialog({ resolve, reject, input }) {
  const [response, setResponse] = useState("");
  return (
    <div role="dialog">
      <div data-testid={$.input.name}>{input}</div>
      <input
        aria-label={$.response.name}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
      />
      <button onClick={() => resolve(response)}>{$.resolve.name}</button>
      <button onClick={() => reject(response)}>{$.reject.name}</button>
    </div>
  );
}

function RenderCounter({ name }: { name: string }) {
  const count = useRef(0);
  count.current++;
  return null;
  //return <div data-testid={name}>{count.current}</div>;
}

const formatResult = (r: unknown) => JSON.stringify(r);

const $ = {
  dialog: el("dialog", (role) => cy.findByRole(role)),
  resolve: el("resolve", roleByName("button")),
  reject: el("reject", roleByName("button")),
  input: el("input", (id) => cy.findByTestId(id)),
  response: el("input", roleByName("textbox")),
  result: el("result", (id) => cy.findByTestId(id)),
  trigger: el("trigger", roleByName("button")),
  appRC: el("app-render-count", (id) => cy.findByTestId(id)),
  pageRC: el("page-render-count", (id) => cy.findByTestId(id)),
};

function roleByName<Role extends string>(role: Role) {
  return (name: string) => cy.findByRole(role, { name });
}

function el<Name extends string, Selection>(
  name: Name,
  select: (name: Name) => Selection
) {
  return {
    name,
    get target() {
      return select(name);
    },
  };
}
