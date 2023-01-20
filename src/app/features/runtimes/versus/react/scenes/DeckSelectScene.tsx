import Button from "@mui/material/Button";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { adapter } from "../../definition";
import { Center } from "../../../../../components/Center";
import type { RuntimeDeck, RuntimeGenerics } from "../../../../compiler/types";
import { Select } from "../../../../../controls/Select";

export function DeckSelectScene() {
  const { startBattle } = adapter.useRuntimeActions();
  const decks = adapter.useRuntimeState((state) => state.decks ?? []);
  const [player1Deck, setPlayer1Deck] = useState(decks[0]);
  const [player2Deck, setPlayer2Deck] = useState(decks[1 % decks.length]);
  function startWithSelectedDecks() {
    startBattle({
      player1Deck: player1Deck.id,
      player2Deck: player2Deck.id,
    });
  }

  if (!decks.length) {
    return (
      <Center sx={{ textAlign: "center" }}>
        No decks available
        <br />
        Cannot start game
      </Center>
    );
  }

  return (
    <Center>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <DeckSelector
            label="Player 1 Deck"
            value={player1Deck}
            onChange={setPlayer1Deck}
            options={decks}
          />
          <DeckSelector
            label="Player 2 Deck"
            value={player2Deck}
            onChange={setPlayer2Deck}
            options={decks}
          />
        </Stack>
        <Stack direction="row">
          <Button
            sx={{ margin: "auto" }}
            variant="contained"
            onClick={startWithSelectedDecks}
          >
            Start game
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}

function DeckSelector<G extends RuntimeGenerics>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: RuntimeDeck<G>;
  options: RuntimeDeck<G>[];
  onChange: (value: RuntimeDeck<G>) => void;
}) {
  return (
    <Select
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      getOptionLabel={(deck) => deck.name}
      getOptionValue={(deck) => deck.id}
    />
  );
}
