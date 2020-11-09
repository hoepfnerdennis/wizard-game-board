import React from "react";
import { Box, Button, Flex, Heading } from "rebass";
import { useGameStarted, usePlayers, useReset, useStartGame } from "./store";
import PlayerName from "./PlayerName";
import Game from "./Game";
import colors from "./colors";

const App = () => {
  const players = usePlayers();
  const startGame = useStartGame();
  const gameStarted = useGameStarted();
  const reset = useReset();

  const resetToNewGame = () => {
    if (window.confirm("Sicher? Alle Einträge werden gelöscht...")) {
      reset();
    }
  };

  return (
    <Box m="0 auto" maxWidth={900} bg="">
      <Box sx={{ display: "grid", gridTemplateColumns: "8fr 1fr" }} m={3}>
        <Heading color={colors.primary} fontSize={7} textAlign="center">
          Wizard
        </Heading>
        <Button
          sx={{ justifySelf: "end", alignSelf: "center" }}
          p={10}
          onClick={resetToNewGame}
          bg={colors.primary}
        >
          Neu
        </Button>
      </Box>
      {gameStarted ? (
        <Game />
      ) : (
        <>
          <Flex flexWrap="wrap" mx={3} justifyContent="space-between">
            {players.map((_, index) => (
              <PlayerName id={index} key={index} />
            ))}
          </Flex>
          <Flex mx={3}>
            <Button
              disabled={!(players.filter((p) => p.name !== "").length >= 3)}
              onClick={startGame}
              flex={1}
              bg={
                !(players.filter((p) => p.name !== "").length >= 3)
                  ? "lightgray"
                  : colors.primary
              }
            >
              Auf geht's!
            </Button>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default App;
