import {
  AllyTrade,
  AssignedPosition,
  BanPickResult,
  ChampSelectPhaseSession,
  SelectedResult,
  SimpleChampSelectPhaseSessionData,
} from "../types/lcuType";
import { GameMode, PositionName } from "../types/opgg_rank_type";

export function getSelectChampIdAndPosition(data: ChampSelectPhaseSession) {
  const result = data.myTeam.find((t) => t.cellId === data.localPlayerCellId);
  if (result?.championId) {
    return {
      championId: result.championId,
      position: convertPositionToOpggPosition(result.assignedPosition),
    } as SelectedResult;
  }
}

export function getBanPickResult(data: ChampSelectPhaseSession) {
  const banPickResult: BanPickResult = { ban: [], pick: [] };
  data.actions
    .flatMap((actions) => actions)
    .filter((i) => i.championId)
    .forEach((i) => {
      const { championId, completed, isAllyAction, actorCellId } = i;
      if (i.type === "ban") {
        banPickResult.ban.push({
          championId,
          completed,
          isAllyAction,
          actorCellId,
        });
      } else if (i.type === "pick") {
        banPickResult.pick.push({
          championId,
          completed,
          isAllyAction,
          actorCellId,
        });
      }
    });
  return banPickResult;
}

export function convertPositionToOpggPosition(position: AssignedPosition) {
  position = position.toLowerCase() as AssignedPosition;
  return ({
    bottom: "adc",
    jungle: "jungle",
    middle: "mid",
    utility: "support",
    top: "top",
  }[position] || "mid") as PositionName;
}

export function parseGameSessionData(
  data: ChampSelectPhaseSession,
  gameMode: GameMode,
) {
  const selectedResult = getSelectChampIdAndPosition(data);
  const banPickResult = getBanPickResult(data);
  const benchChampions = data.benchChampions;
  const benchEnabled = data.benchEnabled;
  const allyTrades = data.trades.map((i) => {
    const team = data.myTeam.find((t) => t.cellId === i.cellId);
    return { ...i, championId: team?.championId } as AllyTrade;
  });
  return {
    banPick: banPickResult,
    selectedResult,
    benchChampions,
    benchEnabled,
    allyTrades,
    gameMode,
  } as SimpleChampSelectPhaseSessionData;
}