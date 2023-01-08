import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { adapter } from "../definition";
import { Center } from "../../../../components/Center";
import type { RuntimeDeck, RuntimeGenerics } from "../../../compiler/types";

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
    <FormControl>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value.id}
        label={label}
        onChange={(e) => {
          const newDeck = options.find((d) => d.id === e.target.value);
          if (newDeck) {
            onChange(newDeck);
          }
        }}
      >
        {options.map((deck) => (
          <MenuItem key={deck.id} value={deck.id}>
            {deck.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
