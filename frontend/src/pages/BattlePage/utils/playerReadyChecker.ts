import { PlayerState } from "@/store/useGameStore";

/**
 * Проверяет, есть ли два игрока в комнате
 */
export const hasTwoPlayers = (players: PlayerState[]): boolean => {
  return players.length === 2;
};

/**
 * Проверяет, готовы ли оба игрока
 */
export const areBothPlayersReady = (players: PlayerState[]): boolean => {
  return players.length === 2 && players.every((player) => player.isReady);
};

/**
 * Проверяет, нужно ли запускать таймер готовности
 * Таймер должен запускаться когда:
 * - Есть 2 игрока в комнате
 * - Игра еще не началась
 * - Не все игроки готовы
 */
export const shouldStartReadyTimer = (
  players: PlayerState[],
  gameStarted: boolean
): boolean => {
  const result =
    hasTwoPlayers(players) && !gameStarted && !areBothPlayersReady(players);

  console.log("shouldStartReadyTimer check:", {
    hasTwoPlayers: hasTwoPlayers(players),
    gameStarted,
    areBothPlayersReady: areBothPlayersReady(players),
    players: players.map((p) => ({
      id: p.user.id,
      username: p.user.username,
      isReady: p.isReady,
    })),
    result,
    timestamp: new Date().toISOString(),
  });

  return result;
};

/**
 * Находит неготовых игроков
 */
export const getUnreadyPlayers = (players: PlayerState[]): PlayerState[] => {
  return players.filter((player) => !player.isReady);
};
