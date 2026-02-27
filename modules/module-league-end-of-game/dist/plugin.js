"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleData_1 = require("./handleData");
module.exports = async (ctx) => {
    const namespace = ctx.plugin.module.getName();
    let state = {
        status: 'NO_GAME',
        displayState: 'ITEMS',
        featTeamId: 300,
        winnerTeamId: 300,
        gameDuration: 0,
        teams: {},
        participants: {},
        goldFrames: {},
        eventTimeline: {},
        timelineData: {},
        matchData: {}
    };
    // Register new UI page
    ctx.LPTE.emit({
        meta: {
            type: 'add-pages',
            namespace: 'ui',
            version: 1
        },
        pages: [
            {
                name: 'LoL: End of Game',
                frontend: 'frontend',
                id: `op-${namespace}`
            }
        ]
    });
    ctx.LPTE.on(namespace, 'end-of-game', async (e) => {
        state.displayState = e.state;
    });
    // Answer requests to get state
    ctx.LPTE.on(namespace, 'request', (e) => {
        ctx.LPTE.emit({
            meta: {
                type: e.meta.reply,
                namespace: 'reply',
                version: 1
            },
            state
        });
    });
    ctx.LPTE.on('module-league-state', 'match-game-loaded', (e) => {
        const matchData = e.state.web.match;
        const timelineData = e.state.web.timeline;
        const emdOfGameData = new handleData_1.EndOfGameData(matchData, timelineData);
        emdOfGameData.onReady(() => {
            state.matchData = emdOfGameData.matchData
            console.log(emdOfGameData.gameDuration)
            state.gameDuration = emdOfGameData.gameDuration
            state.timelineData = emdOfGameData.timelineData
            state.winnerTeamId = emdOfGameData.winnerTeamId
            state.featTeamId = emdOfGameData.featTeamId
            state.eventTimeline = emdOfGameData.eventTimeline
            state.status = 'GAME_LOADED';
            state.teams = emdOfGameData.teams;
            state.participants = emdOfGameData.participants;
            state.goldFrames = emdOfGameData.goldFrames;
            ctx.LPTE.emit({
                meta: {
                    namespace,
                    type: 'update',
                    version: 1
                },
                state
            });
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
//# sourceMappingURL=plugin.js.map