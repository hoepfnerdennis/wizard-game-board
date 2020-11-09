import { Input, Label } from "@rebass/forms";
import React, { ChangeEvent, FC, memo } from "react";
import { Box } from "rebass";
import { usePlayer, useSetPlayer } from "./store";

const PlayerName: FC<{ id: number }> = ({ id }) => {
  const player = usePlayer(id);
  const setPlayer = useSetPlayer();

  const updatePlayerName = (e: ChangeEvent<HTMLInputElement>) => {
    setPlayer(id, { ...player, name: e.target.value });
  };

  return (
    <Box mb={10} width={.3}>
      <Label htmlFor={`name ${id}`}>{`Spieler ${id + 1}`}</Label>
      <Input
        id={`name ${id}`}
        name="Name"
        type="text"
        placeholder="Name..."
        onChange={updatePlayerName}
        value={player.name}
      />
    </Box>
  );
};

export default memo(PlayerName);
