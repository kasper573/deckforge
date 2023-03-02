import type { ComponentProps } from "react";
import { useRef, useState } from "react";
import { createImperative } from "../../src/lib/use-imperative-component/useImperativeComponent";

describe("useImperativeComponent", () => {
  it("mounting component does not cy.mount its element", () => {
    cy.mount(<App />);
    $.dialog.target.should("not.exist");
  });

  it("triggering component cy.mounts one element", () => {
    cy.mount(<App />);
    $.trigger.target.click();
    $.dialog.target.should("exist");
  });

  it("resolving returns a value", () => {
    cy.mount(<App />);
    $.trigger.target.click();
    $.dialog.target.within(() => {
      $.input.target.type("value");
      $.resolve.target.click();
    });
    $.result.target.should(
      "have.text",
      formatResult({ type: "success", value: "value" })
    );
  });

  it("rejecting returns an error", () => {
    cy.mount(<App />);
    $.trigger.target.click();
    $.dialog.target.within(() => {
      $.input.target.type("error");
      $.reject.target.click();
    });
    $.result.target.should(
      "have.text",
      formatResult({ type: "error", error: "error" })
    );
  });

  it("resolving removes the element", () => {
    cy.mount(<App />);
    $.trigger.target.click();
    $.resolve.target.click();
    $.dialog.target.should("not.exist");
  });

  it("rejecting removes the element", () => {
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
      <RenderCounter name={$.appRC.label} />
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
      <RenderCounter name={$.pageRC.label} />
      {result && <div data-testid="result">{formatResult(result)}</div>}
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
      <div data-testid={$.input.label}>{input}</div>
      <input
        name={$.response.label}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
      />
      <button onClick={() => resolve(response)}>{$.resolve.label}</button>
      <button onClick={() => reject(response)}>{$.reject.label}</button>
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

function el<Label extends string, Selection>(
  label: Label,
  select: (label: Label) => Selection
) {
  return {
    label,
    get target() {
      return select(label);
    },
  };
}
