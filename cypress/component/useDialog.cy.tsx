import { useState } from "react";
import type { DialogProps } from "../../src/shared/useDialog";
import { DialogOutlet, useDialog } from "../../src/shared/useDialog";

describe("useDialog.cy.ts", () => {
  it("can wait for and receive dialog resolution value based on input", () => {
    function ExampleApp() {
      const [response, setResponse] = useState("");
      const openDialog = useDialog(ExampleDialog);
      return (
        <>
          {response && <span>Response: {response}</span>}
          <button
            onClick={async () =>
              setResponse(await openDialog({ count: 123, title: "Title" }))
            }
          >
            Open dialog
          </button>
          <DialogOutlet />
        </>
      );
    }

    cy.mount(<ExampleApp />);
    cy.findByRole("button", { name: "Open dialog" }).click();
    cy.findByRole("dialog").should("be.visible");
    cy.findByRole("dialog").within(() => {
      cy.findByRole("heading", { name: "Title" }).should("exist");
      cy.findByRole("button", { name: "OK" }).click();
    });
    cy.findByText("Response: Hello 123").should("exist");
  });
});

type ExampleDialogProps = DialogProps<
  string,
  {
    count: number;
    title: string;
  }
>;

function ExampleDialog({
  open,
  input: { title, count },
  resolve,
}: ExampleDialogProps) {
  return (
    <div role="dialog" style={{ display: open ? "block" : "none" }}>
      <h1>{title}</h1>
      <button onClick={() => resolve(`Hello ${count}`)}>OK</button>
    </div>
  );
}
