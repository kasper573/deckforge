import { useState } from "react";
import type { ModalProps } from "../../src/lib/useModal";
import { ModalOutlet, useModal } from "../../src/lib/useModal";

describe("useModal.cy.ts", () => {
  it("can wait for and receive modal resolution value based on input", () => {
    function ExampleApp() {
      const [response, setResponse] = useState("");
      const openModal = useModal(ExampleModal);
      return (
        <>
          {response && <span>Response: {response}</span>}
          <button
            onClick={async () =>
              setResponse(await openModal({ count: 123, title: "Title" }))
            }
          >
            Open modal
          </button>
          <ModalOutlet />
        </>
      );
    }

    cy.mount(<ExampleApp />);
    cy.findByRole("button", { name: "Open modal" }).click();
    cy.findByRole("modal").should("be.visible");
    cy.findByRole("modal").within(() => {
      cy.findByRole("heading", { name: "Title" }).should("exist");
      cy.findByRole("button", { name: "OK" }).click();
    });
    cy.findByText("Response: Hello 123").should("exist");
  });
});

type ExampleModalProps = ModalProps<
  string,
  {
    count: number;
    title: string;
  }
>;

function ExampleModal({
  open,
  input: { title, count },
  resolve,
}: ExampleModalProps) {
  return (
    <div role="modal" style={{ display: open ? "block" : "none" }}>
      <h1>{title}</h1>
      <button onClick={() => resolve(`Hello ${count}`)}>OK</button>
    </div>
  );
}
