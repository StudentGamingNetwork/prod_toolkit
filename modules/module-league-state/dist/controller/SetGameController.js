"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetGameController = void 0;
const Controller_1 = require("./Controller");
const LeagueState_1 = require("../LeagueState");
const extendLiveGameWithStatic_1 = __importDefault(require("../extendLiveGameWithStatic"));
const path_1 = require("path");
class SetGameController extends Controller_1.Controller {
    async handle(event) {
        var _a, _b, _c;
        const replyMeta = {
            namespace: 'reply',
            type: event.meta.reply,
            version: 1
        };
        const staticData = await this.pluginContext.LPTE.request({
            meta: {
                namespace: 'module-league-static',
                type: 'request-constants',
                version: 1
            }
        });
        if (!staticData) {
            this.pluginContext.log.info(`Failed to load statics`);
            this.pluginContext.LPTE.emit({
                meta: replyMeta
            });
            return;
        }
        if (event.by === 'summonerName') {
            // Load game using plugin-webapi
            this.pluginContext.log.debug(`Loading livegame for summoner=${event.summonerName}`);
            const gameResponse = await this.pluginContext.LPTE.request({
                meta: {
                    namespace: 'plugin-webapi',
                    type: 'fetch-livegame',
                    version: 1
                },
                summonerName: event.summonerName,
                retries: 0
            });
            if (!gameResponse || gameResponse.failed) {
                this.pluginContext.log.error(`Loading livegame failed for summoner=${event.summonerName}`);
                this.pluginContext.LPTE.emit({
                    meta: replyMeta
                });
                return;
            }
            LeagueState_1.state.web.live = (0, extendLiveGameWithStatic_1.default)(gameResponse.game, staticData.constants);
            LeagueState_1.state.web.live._available = true;
            LeagueState_1.state.web.live._created = new Date();
            LeagueState_1.state.web.live._updated = new Date();
            this.pluginContext.LPTE.emit({
                meta: {
                    namespace: this.pluginContext.plugin.module.getName(),
                    type: 'live-game-loaded',
                    version: 1
                },
                state: LeagueState_1.state
            });
            this.pluginContext.LPTE.emit({
                meta: replyMeta,
                data: LeagueState_1.state.web.live
            });
        }
        else if (event.by === 'gameId') {
            if (!event.gameId) {
                event.gameId = LeagueState_1.state.web.live.gameId;
                // event.gameId = "7762070187"
            }
            // else { event.gameId = "7762070187" }
            // Load game using plugin-webapi
            this.pluginContext.log.debug(`Loading match for gameId=${event.gameId}`);
            const gameResponse = await this.pluginContext.LPTE.request({
                meta: {
                    namespace: 'plugin-webapi',
                    type: 'fetch-match',
                    version: 1
                },
                matchId: event.gameId
            });
            LeagueState_1.state.web.match = gameResponse === null || gameResponse === void 0 ? void 0 : gameResponse.match;
            LeagueState_1.state.web.timeline = gameResponse === null || gameResponse === void 0 ? void 0 : gameResponse.timeline;
            if (!gameResponse || gameResponse.failed) {
                this.pluginContext.log.error(`Loading match failed for gameId=${event.gameId}`);
                if (((_a = LeagueState_1.state.lcu) === null || _a === void 0 ? void 0 : _a.eog) === undefined ||
                    LeagueState_1.state.lcu.eog === null ||
                    !LeagueState_1.state.lcu.eog._available) {
                    this.pluginContext.LPTE.emit({
                        meta: replyMeta
                    });
                    return;
                }
                const lcuEog = LeagueState_1.state.lcu.eog;
                const ps = (_b = lcuEog.teams) === null || _b === void 0 ? void 0 : _b.map((t) => {
                    var _a;
                    return (_a = t.players) === null || _a === void 0 ? void 0 : _a.map((p, i) => {
                        return {
                            assists: p.stats.ASSISTS,
                            baronKills: 0,
                            bountyLevel: 0,
                            challenges: {},
                            champExperience: 0,
                            champLevel: 0,
                            championId: (0, path_1.basename)(p.championSquarePortraitPath, (0, path_1.extname)(p.championSquarePortraitPath)),
                            championName: p.championName,
                            championTransform: 0,
                            consumablesPurchased: 0,
                            damageDealtToBuildings: p.stats.TOTAL_DAMAGE_DEALT_TO_BUILDINGS,
                            damageDealtToObjectives: p.stats.TOTAL_DAMAGE_DEALT_TO_OBJECTIVES,
                            damageDealtToTurrets: p.stats.TOTAL_DAMAGE_DEALT_TO_TURRETS,
                            damageSelfMitigated: p.stats.TOTAL_DAMAGE_SELF_MITIGATED,
                            deaths: p.stats.NUM_DEATHS,
                            detectorWardsPlaced: p.stats.WARD_PLACED,
                            doubleKills: 0,
                            dragonKills: 0,
                            firstBloodAssist: false,
                            firstBloodKill: false,
                            firstTowerAssist: false,
                            firstTowerKill: false,
                            gameEndedInEarlySurrender: false,
                            gameEndedInSurrender: false,
                            goldEarned: p.stats.GOLD_EARNED,
                            goldSpent: 0,
                            individualPosition: p.selectedPosition,
                            inhibitorKills: p.stats.BARRACKS_KILLED,
                            inhibitorTakedowns: 0,
                            inhibitorsLost: 0,
                            item0: p.items[0],
                            item1: p.items[1],
                            item2: p.items[2],
                            item3: p.items[3],
                            item4: p.items[4],
                            item5: p.items[5],
                            item6: p.items[6],
                            itemsPurchased: 0,
                            killingSprees: 0,
                            kills: p.stats.CHAMPIONS_KILLED,
                            lane: p.detectedTeamPosition,
                            largestCriticalStrike: p.stats.LARGEST_CRITICAL_STRIKE,
                            largestKillingSpree: p.stats.LARGEST_KILLING_SPREE,
                            largestMultiKill: p.stats.LARGEST_MULTI_KILL,
                            longestTimeSpentLiving: 0,
                            magicDamageDealt: p.stats.MAGIC_DAMAGE_DEALT_TO_CHAMPIONS,
                            magicDamageDealtToChampions: p.stats.MAGIC_DAMAGE_DEALT_TO_CHAMPIONS,
                            magicDamageTaken: p.stats.MAGIC_DAMAGE_TAKEN,
                            neutralMinionsKilled: p.stats.NEUTRAL_MINIONS_KILLED,
                            nexusKills: 0,
                            nexusTakedowns: 0,
                            nexusLost: 0,
                            objectivesStolen: 0,
                            objectivesStolenAssists: 0,
                            participantId: t.teamId === 100 ? i : i + 5,
                            pentaKills: 0,
                            perks: {},
                            physicalDamageDealt: p.stats.PHYSICAL_DAMAGE_DEALT_TO_CHAMPIONS,
                            physicalDamageDealtToChampions: p.stats.PHYSICAL_DAMAGE_DEALT_TO_CHAMPIONS,
                            physicalDamageTaken: p.stats.PHYSICAL_DAMAGE_TAKEN,
                            profileIcon: p.profileIconId,
                            puuid: p.puuid,
                            quadraKills: 0,
                            riotIdName: '',
                            riotIdTagline: '',
                            role: p.detectedTeamPosition,
                            sightWardsBoughtInGame: p.stats.SIGHT_WARDS_BOUGHT_IN_GAME,
                            spell1Casts: 0,
                            spell2Casts: 0,
                            spell3Casts: 0,
                            spell4Casts: 0,
                            summoner1Casts: p.stats.SPELL1_CAST,
                            summoner1Id: p.spell1Id,
                            summoner2Casts: p.stats.SPELL2_CAST,
                            summoner2Id: p.spell2Id,
                            summonerId: p.summonerId,
                            summonerLevel: p.level,
                            summonerName: p.summonerName,
                            teamEarlySurrendered: t.stats.TEAM_EARLY_SURRENDERED,
                            teamId: t.teamId,
                            teamPosition: p.detectedTeamPosition,
                            timeCCingOthers: p.stats.TIME_CCING_OTHERS,
                            timePlayed: 0,
                            totalDamageDealt: p.stats.TOTAL_DAMAGE_DEALT,
                            totalDamageDealtToChampions: p.stats.TOTAL_DAMAGE_DEALT_TO_CHAMPIONS,
                            totalDamageShieldedOnTeammates: p.stats.TOTAL_DAMAGE_SHIELDED_ON_TEAMMATES,
                            totalDamageTaken: p.stats.TOTAL_DAMAGE_TAKEN,
                            totalHeal: p.stats.TOTAL_HEAL,
                            totalHealsOnTeammates: p.stats.TOTAL_HEAL_ON_TEAMMATES,
                            totalMinionsKilled: p.stats.MINIONS_KILLED,
                            totalTimeCCDealt: p.stats.TOTAL_TIME_CROWD_CONTROL_DEALT,
                            totalTimeSpentDead: p.stats.TOTAL_TIME_SPENT_DEAD,
                            totalUnitsHealed: 0,
                            tripleKills: 0,
                            trueDamageDealt: p.stats.TRUE_DAMAGE_DEALT_PLAYER,
                            trueDamageDealtToChampions: p.stats.TRUE_DAMAGE_DEALT_TO_CHAMPIONS,
                            trueDamageTaken: p.stats.TRUE_DAMAGE_TAKEN,
                            turretKills: p.stats.TURRETS_KILLED,
                            turretTakedowns: 0,
                            turretsLost: 0,
                            unrealKills: 0,
                            visionScore: p.stats.VISION_SCORE,
                            visionWardsBoughtInGame: p.stats.VISION_WARDS_BOUGHT_IN_GAME,
                            wardsKilled: p.stats.WARD_KILLED,
                            wardsPlaced: p.stats.WARD_PLACED,
                            win: t.isWinningTeam
                        };
                    });
                });
                const newWebState = {
                    metadata: {
                        dataVersion: '1',
                        matchId: event.gameId,
                        participants: []
                    },
                    info: {
                        gameDuration: lcuEog.gameLength,
                        gameType: lcuEog.gameType,
                        gameId: event.gameId,
                        gameMode: lcuEog.gameMode,
                        participants: [...ps[0], ...ps[1]],
                        teams: (_c = lcuEog.teams) === null || _c === void 0 ? void 0 : _c.map((t) => {
                            var _a, _b;
                            return {
                                teamId: t.teamId,
                                win: t.isWinningTeam,
                                bans: t.teamId === 100
                                    ? ((_a = LeagueState_1.state.lcu.champselect.bans) === null || _a === void 0 ? void 0 : _a.myTeamBans) || []
                                    : ((_b = LeagueState_1.state.lcu.champselect.bans) === null || _b === void 0 ? void 0 : _b.theirTeamBans) || [],
                                objectives: {
                                    inhibitor: {
                                        first: false,
                                        kills: t.stats.BARRACKS_KILLED
                                    },
                                    tower: {
                                        first: false,
                                        kills: t.stats.TURRETS_KILLED
                                    },
                                    champion: {
                                        first: false,
                                        kills: t.stats.CHAMPIONS_KILLED
                                    },
                                    dragon: {
                                        first: false,
                                        kills: LeagueState_1.state.live.objectives[t.teamId].filter((o) => o.type === 'OnKillDragon_Spectator').length
                                    },
                                    baron: {
                                        first: false,
                                        kills: LeagueState_1.state.live.objectives[t.teamId].filter((o) => o.type === 'OnKillRiftHerald_Spectator').length
                                    },
                                    riftHerald: {
                                        first: false,
                                        kills: LeagueState_1.state.live.objectives[t.teamId].filter((o) => o.type === 'OnKillWorm_Spectator').length
                                    }
                                }
                            };
                        })
                    }
                };
                LeagueState_1.state.web.match = newWebState;
            }
            if (LeagueState_1.state.web.match !== undefined) {
                LeagueState_1.state.web.match._available = true;
                LeagueState_1.state.web.match._created = new Date();
                LeagueState_1.state.web.match._updated = new Date();
            }
            else {
                LeagueState_1.state.web.match = {
                    _available: false
                };
            }
            if (LeagueState_1.state.web.timeline !== undefined) {
                LeagueState_1.state.web.timeline._available = true;
                LeagueState_1.state.web.timeline._created = new Date();
                LeagueState_1.state.web.timeline._updated = new Date();
            }
            else {
                LeagueState_1.state.web.timeline = {
                    _available: false
                };
            }
            this.pluginContext.LPTE.emit({
                meta: {
                    namespace: this.pluginContext.plugin.module.getName(),
                    type: 'match-game-loaded',
                    version: 1
                },
                state: LeagueState_1.state
            });
            this.pluginContext.LPTE.emit({
                meta: replyMeta,
                data: LeagueState_1.state.web.match
            });
        }
    }
}
exports.SetGameController = SetGameController;
//# sourceMappingURL=SetGameController.js.map