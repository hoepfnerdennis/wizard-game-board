import React, { FC } from "react";
import { Box, Text } from "rebass";
import colors from "./colors";
import { usePlayers, useRound, useRoundStats } from "./store";
import Table from "./Table";

const Game: FC = () => {
  const players = usePlayers();
  const [currentRound, totalRounds] = useRoundStats();
  const finalRound = useRound(totalRounds);
  console.log(finalRound);

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `2fr repeat(${players.length}, 5fr)`,
          alignItems: "center",
        }}
      >
        <Box sx={{ gridColumn: 1 }} p={1} bg={colors.primary} height="100%" />
        {players.map((player, i) => (
          <Box
            sx={{ gridColumn: i + 2, textAlign: "center" }}
            p={1}
            bg={colors.primary}
          >
            <Text color="white" fontWeight="bold">
              {player.name}
            </Text>
          </Box>
        ))}
        {currentRound > totalRounds && (
          <>
            <Box
              sx={{ gridColumn: 1 }}
              p={1}
              bg={colors.primary}
              height="100%"
            />
            {players.map((_, i) => (
              <Box
                sx={{ gridColumn: i + 2, textAlign: "center" }}
                p={1}
                bg={colors.primary}
              >
                <Text color="white" fontWeight="bold">
                  {finalRound[i].count}
                </Text>
              </Box>
            ))}
          </>
        )}
        <Table />
      </Box>
    </>
  );
};

export default Game;
