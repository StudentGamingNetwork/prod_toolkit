"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const initialState = {
  state: 'NO_MATCHES',
  matches: [],
  rounds: {}
};

const gameMatrix = [
  [4, null],
  [4, null],
  [5, null],
  [5, null],
  [6, 7],
  [6, 7]
];

module.exports = async (ctx) => {
  const namespace = ctx.plugin.module.getName();
  let gfxState = initialState;

  // Register new UI page
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [
      {
        name: 'Waiting Matches',
        frontend: 'frontend',
        id: `op-${namespace}`
      }
    ]
  });

  // Helper to answer a request (request + request-current)
  const replyState = (e) => {
    ctx.LPTE.emit({
      meta: {
        type: e.meta.reply,
        namespace: 'reply',
        version: 1
      },
      state: gfxState.state,
      matches: gfxState.matches,
      rounds: gfxState.rounds
    });
  };

  // Answer requests to get state (operator legacy)
  ctx.LPTE.on(namespace, 'request', async (e) => {
    replyState(e);
  });

  // ✅ NEW: Answer requests to get current state (gfx pattern like module-teams)
  ctx.LPTE.on(namespace, 'request-current', async (e) => {
    replyState(e);
  });

  ctx.LPTE.on(namespace, 'set', async (e) => {
    gfxState.state = 'READY';

    // ✅ guard: tolerate missing/invalid payload
    const incomingMatches = Array.isArray(e.matches) ? e.matches : [];
    gfxState.matches = [...incomingMatches];
    gfxState.rounds = e.rounds ?? gfxState.rounds ?? {};

    for (const match of Object.values(gfxState.matches)) {
      // Guard against weird entries
      if (!match || typeof match !== 'object') continue;

      // Keep existing behavior: if marked current match, push to module-teams
      if (match.current_match) {
        ctx.LPTE.emit({
          meta: {
            type: 'set',
            namespace: 'module-teams',
            version: 1
          },
          teams: match.teams,
          bestOf: match.bestOf
        });
      }

      // Existing bracket propagation logic
      // Guard matchId
      if (typeof match.matchId !== 'number') continue;
      if (match.matchId > 5) continue;

      const [winGame, loseGame] = gameMatrix[match.matchId] || [];
      if (winGame == null) continue;

      // Guard nested structures
      const bestOf = Number(match.bestOf ?? 0);
      const blueScore = Number(match?.teams?.blueTeam?.score ?? 0);
      const redScore  = Number(match?.teams?.redTeam?.score ?? 0);

      // Also guard target matches existence
      if (!gfxState.matches[winGame] || !gfxState.matches[winGame].teams) continue;
      if (loseGame != null && (!gfxState.matches[loseGame] || !gfxState.matches[loseGame].teams)) continue;

      if (blueScore > bestOf / 2) {
        if (match.matchId % 2 == 0) {
          gfxState.matches[winGame].teams.blueTeam = {
            name: match.teams.blueTeam.name,
            tag: match.teams.blueTeam.tag,
            score: gfxState.matches[winGame].teams.blueTeam.score
          };
        } else {
          gfxState.matches[winGame].teams.redTeam = {
            name: match.teams.blueTeam.name,
            tag: match.teams.blueTeam.tag,
            score: gfxState.matches[winGame].teams.redTeam.score
          };
        }

        if (loseGame == null) continue;

        if (match.matchId % 2 == 0) {
          gfxState.matches[loseGame].teams.blueTeam = {
            name: match.teams.redTeam.name,
            tag: match.teams.redTeam.tag,
            score: gfxState.matches[loseGame].teams.blueTeam.score
          };
        } else {
          gfxState.matches[loseGame].teams.redTeam = {
            name: match.teams.redTeam.name,
            tag: match.teams.redTeam.tag,
            score: gfxState.matches[loseGame].teams.redTeam.score
          };
        }

      } else if (redScore > bestOf / 2) {
        if (match.matchId % 2 == 0) {
          gfxState.matches[winGame].teams.blueTeam = {
            name: match.teams.redTeam.name,
            tag: match.teams.redTeam.tag,
            score: gfxState.matches[winGame].teams.blueTeam.score
          };
        } else {
          gfxState.matches[winGame].teams.redTeam = {
            name: match.teams.redTeam.name,
            tag: match.teams.redTeam.tag,
            score: gfxState.matches[winGame].teams.redTeam.score
          };
        }

        if (loseGame == null) continue;

        if (match.matchId % 2 == 0) {
          gfxState.matches[loseGame].teams.blueTeam = {
            name: match.teams.blueTeam.name,
            tag: match.teams.blueTeam.tag,
            score: gfxState.matches[loseGame].teams.blueTeam.score
          };
        } else {
          gfxState.matches[loseGame].teams.redTeam = {
            name: match.teams.blueTeam.name,
            tag: match.teams.blueTeam.tag,
            score: gfxState.matches[loseGame].teams.redTeam.score
          };
        }
      }
    }

    // Broadcast update to all clients (gfx + operator)
    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      state: gfxState.state,
      matches: gfxState.matches,
      rounds: gfxState.rounds
    });
  });

  ctx.LPTE.on(namespace, 'unset', (e) => {
    gfxState.state = 'NO_MATCHES';
    gfxState.matches = [];
    gfxState.rounds = {};

    ctx.LPTE.emit({
      meta: {
        type: 'update',
        namespace,
        version: 1
      },
      state: gfxState.state,
      matches: gfxState.matches,
      rounds: gfxState.rounds
    });
  });

  // Emit event that we're ready to operate
  ctx.LPTE.emit({
    meta: {
      type: 'plugin-status-change',
      namespace: 'lpt',
      version: 1
    },
    status: 'RUNNING'
  });
};