import { Select } from "@rebass/forms";
import React, { ChangeEvent, FC, useState } from "react";
import { Box, Button, Text } from "rebass";
import colors from "./colors";
import {
  useNewRound,
  usePlayers,
  useRound,
  useRoundStats,
  useSetMadeTricksForPlayer,
  useSetPromisedTricksForPlayer,
  useTrickSum,
} from "./store";

enum RoundState {
  START,
  RESULT,
  DONE,
}

const getTricks = (round: number) => {
  const tricks = new Array(round + 1).fill(0).map((_, i) => i);
  return tricks;
};

const Table: FC = () => {
  const players = usePlayers();
  const [state, setState] = useState(RoundState.START);
  const [currentRound] = useRoundStats();
  const startNewRound = useNewRound();
  const trickSum = useTrickSum(currentRound);

  const Round: FC<{ round: number }> = ({ round }) => {
    const roundValues = useRound(round);
    const isActive = currentRound === round;
    const promise = useSetPromisedTricksForPlayer();
    const made = useSetMadeTricksForPlayer();

    const Line: FC<{ id: number }> = ({ id }) => {
      const setPromise = (e: ChangeEvent<HTMLSelectElement>) => {
        promise(id, round, parseInt(e.target.value));
      };
      const setMade = (e: ChangeEvent<HTMLSelectElement>) => {
        made(id, round, parseInt(e.target.value));
      };
      if (state === RoundState.START && isActive) {
        return (
          <Select
            id="promise"
            name="Stiche (angesagt)"
            onChange={setPromise}
            value={roundValues[id].promised}
          >
            {getTricks(round).map((trick) => (
              <option key={trick} value={trick}>
                {trick}
              </option>
            ))}
          </Select>
        );
      }
      if (state === RoundState.RESULT && isActive) {
        return (
          <>
            <Text fontWeight="bold" textAlign="end" mb={1}>
              {roundValues[id].promised}
            </Text>
            <Select
              id="made"
              name="Stiche (gemacht)"
              onChange={setMade}
              value={roundValues[id].made}
            >
              {getTricks(round).map((trick) => (
                <option key={trick} value={trick}>
                  {trick}
                </option>
              ))}
            </Select>
          </>
        );
      }
      return (
        <Box
          display="flex"
          sx={{ alignItems: "center", justifyContent: "flex-end" }}
        >
          <Text fontWeight="bold" textAlign="end">
            {roundValues[id].count}
          </Text>
          <Box ml={1}>
            <Text textAlign="end" fontSize={1}>
              {roundValues[id].promised}
            </Text>
            <Text textAlign="end" fontSize={1}>
              {roundValues[id].made}
            </Text>
          </Box>
        </Box>
      );
    };

    return (
      <>
        <Box sx={{ gridColumn: 1 }} p={1}>
          <Text fontWeight="bold">{round}</Text>
        </Box>
        {players.map((_, index) => (
          <Box sx={{ gridColumn: index + 2 }} p={1}>
            <Line id={index} />
          </Box>
        ))}
      </>
    );
  };

  const allPromised = () => {
    setState(RoundState.RESULT);
  };

  const nextRound = () => {
    setState(RoundState.START);
    startNewRound();
  };

  const roundValues = useRound(currentRound);
  const countMade = roundValues.reduce((c, { made }) => c + made, 0);

  return (
    <>
      {Array.from({ length: currentRound }).map((_, round) => (
        <Round round={round + 1} />
      ))}
      {state === RoundState.START && (
        <Box sx={{ gridColumn: "1 / 100" }} mx={3} mt={3}>
          <Button
            width="100%"
            disabled={trickSum === currentRound}
            bg={trickSum === currentRound ? "gray" : colors.primary}
            onClick={allPromised}
            >
            Angesagt
          </Button>
        </Box>
      )}
      {state === RoundState.RESULT && (
          <Box sx={{ gridColumn: "1 / 100" }} mx={3} mt={3}>
          <Button
            width="100%"
            disabled={countMade !== currentRound}
            bg={countMade !== currentRound ? "gray" : colors.primary}
            onClick={nextRound}
          >
            Nächste Runde
          </Button>
        </Box>
      )}
    </>
  );
};

export default Table;
