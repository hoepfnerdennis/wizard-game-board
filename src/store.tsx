import React, {
  createContext,
  useReducer,
  useContext,
  FC,
  Reducer,
  Dispatch,
  useMemo,
} from "react";

interface Round {
  promised: number;
  made: number;
  count?: number;
}

export interface Player {
  name: string;
}

interface Game {
  started: boolean;
  totalRounds: number;
  currentRound: number;
  rounds: Round[][];
}

interface State {
  game: Game;
  players: Player[];
}

const LOCALSTORAGE_KEY = "wizard";

const getStateFromLS = (): State | undefined => {
  try {
    const value = localStorage.getItem(LOCALSTORAGE_KEY);
    if (value) {
      return JSON.parse(value);
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
};

const save = (state: State) => {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
};

const defaultState: State = {
    game: {
      started: false,
      totalRounds: 0,
      currentRound: 0,
      rounds: [
        [
          { promised: 0, made: 0, count: 0 },
          { promised: 0, made: 0, count: 0 },
          { promised: 0, made: 0, count: 0 },
          { promised: 0, made: 0, count: 0 },
          { promised: 0, made: 0, count: 0 },
          { promised: 0, made: 0, count: 0 },
        ],
      ],
    },
    players: [
      { name: "" },
      { name: "" },
      { name: "" },
      { name: "" },
      { name: "" },
      { name: "" },
    ],
  }

const initalState: State = getStateFromLS() || defaultState;

enum ActionTypes {
  "SET_PLAYER" = "SET_PLAYER",
  "START_GAME" = "START_GAME",
  "SET_PROMISED_TRICKS" = "SET_PROMISED_TRICKS",
  "SET_MADE_TRICKS" = "SET_MADE_TRICKS",
  "NEW_ROUND" = "NEW_ROUND",
  "RESET" = "RESET",
}

type Action =
  | {
      type: ActionTypes.SET_PLAYER;
      id: number;
      player: Player;
    }
  | {
      type: ActionTypes.START_GAME;
    }
  | {
      type: ActionTypes.RESET;
    }
  | {
      type: ActionTypes.NEW_ROUND;
    }
  | {
      type: ActionTypes.SET_PROMISED_TRICKS;
      id: number;
      round: number;
      promised: number;
    }
  | {
      type: ActionTypes.SET_MADE_TRICKS;
      id: number;
      round: number;
      made: number;
    };

const reducer: Reducer<State, Action> = (state, action) => {
  let returnState = state;
  switch (action.type) {
    case ActionTypes.SET_PLAYER:
      const setPlayers = [...state.players];
      setPlayers[action.id] = action.player;
      returnState = {
        ...state,
        players: setPlayers,
      };
      break;
    case ActionTypes.RESET:
        returnState = defaultState;
        break;
    case ActionTypes.START_GAME:
      const players = state.players.filter((p) => p.name !== "");
      returnState = {
        ...state,
        players,
        game: {
          started: true,
          totalRounds: 60 / players.length,
          currentRound: 1,
          rounds: initalState.game.rounds,
        },
      };
      break;
    case ActionTypes.NEW_ROUND:
      console.log("new round");
      const currentRounds = [...state.game.rounds];
      currentRounds[currentRounds.length - 1] = currentRounds[
        currentRounds.length - 1
      ].map((round, id) => {
        let count =
          currentRounds.length - 2 >= 0
            ? currentRounds[currentRounds.length - 2][id].count || 0
            : 0;
        if (round.promised === round.made) {
          count += 2 + round.made;
        } else {
          count -= Math.abs(round.promised - round.made);
        }
        return { ...round, count };
      });
      const newRound = state.players.map(
        (): Round => ({ promised: 0, made: 0 })
      );
      returnState = {
        ...state,
        game: {
          ...state.game,
          currentRound: state.game.currentRound + 1,
          rounds: [...currentRounds, newRound],
        },
      };
      break;
    case ActionTypes.SET_PROMISED_TRICKS:
      const promiseRounds = [...state.game.rounds];
      promiseRounds[action.round - 1][action.id].promised = action.promised;
      returnState = {
        ...state,
        game: {
          ...state.game,
          rounds: promiseRounds,
        },
      };
      break;
    case ActionTypes.SET_MADE_TRICKS:
      const madeRounds = [...state.game.rounds];
      madeRounds[action.round - 1][action.id].made = action.made;
      returnState = {
        ...state,
        game: {
          ...state.game,
          rounds: madeRounds,
        },
      };
      break;
    default:
      returnState = state;
  }
  save(returnState);
  return returnState;
};

const fn: Dispatch<Action> = () => {};

const StoreContext = createContext(initalState);
const DispatchContext = createContext(fn);

const StoreProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initalState);
  return (
    <StoreContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StoreContext.Provider>
  );
};

const useDispatch = () => {
  return useContext(DispatchContext);
};

const useStore = () => {
  return useContext(StoreContext);
};

export const usePlayers = () => {
  const state = useStore();
  return state.players;
};

export const usePlayer = (id: number) => {
  const state = useStore();
  return state.players[id];
};

export const useSetPlayer = () => {
  const dispatch = useDispatch();
  return (id: number, player: Player) =>
    dispatch({
      type: ActionTypes.SET_PLAYER,
      id,
      player,
    });
};

export const useReset = () => {
  const dispatch = useDispatch();
  return () => dispatch({ type: ActionTypes.RESET });
};

export const useStartGame = () => {
  const dispatch = useDispatch();
  return () => dispatch({ type: ActionTypes.START_GAME });
};

export const useNewRound = () => {
  const dispatch = useDispatch();
  return () => dispatch({ type: ActionTypes.NEW_ROUND });
};

export const useGameStarted = () => {
  const state = useStore();
  return useMemo(() => state.game.started, [state.game.started]);
};

export const useRoundStats = () => {
  const state = useStore();
  return useMemo(() => [state.game.currentRound, state.game.totalRounds], [
    state.game.currentRound,
    state.game.totalRounds,
  ]);
};

export const useRound = (round: number) => {
  const store = useStore();
  return store.game.rounds[round - 1];
};

export const useRounds = () => {
  const store = useStore();
  return store.game.rounds;
};

export const useTrickSum = (round: number) => {
  const store = useStore();
  let count = 0;
  store.game.rounds[round - 1].forEach((round) => {
    count += round.promised;
  });
  return count;
};

export const useSetPromisedTricksForPlayer = () => {
  const dispatch = useDispatch();
  return (id: number, round: number, promised: number) =>
    dispatch({
      type: ActionTypes.SET_PROMISED_TRICKS,
      id,
      round,
      promised,
    });
};

export const useSetMadeTricksForPlayer = () => {
  const dispatch = useDispatch();
  return (id: number, round: number, made: number) =>
    dispatch({
      type: ActionTypes.SET_MADE_TRICKS,
      id,
      round,
      made,
    });
};

export default StoreProvider;
