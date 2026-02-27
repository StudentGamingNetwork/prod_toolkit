"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndOfGameData = void 0;
const Monster_1 = require("./types/Monster");
class EndOfGameData {
    constructor(matchData, timelineData) {
        this.matchData = matchData;
        this.timelineData = timelineData;
        this.teams = {};
        this.featTeamId = 300;
        this.winnerTeamId = 300;
        this.gameDuration = 0;
        this.participants = {};
        this.goldFrames = {};
        this.eventTimeline = {};
        this._participantsAvailable = false;
        this._teamsAvailable = false;
        this._goldFramesAvailable = false;
        this.handleParticipants();
        this.handleTeams();
        this.handleTimeLine();
    }
    onReady(handler) {
        if (this._goldFramesAvailable &&
            this._participantsAvailable &&
            this._teamsAvailable) {
            handler();
        }
        else {
            this.readyHandler = handler;
        }
    }
    _readyCheck() {
        if (!this.readyHandler)
            return;
        if (!this._goldFramesAvailable ||
            !this._participantsAvailable ||
            !this._teamsAvailable)
            return;
        this.readyHandler();
    }
    handleParticipants() {
        // Since we need the handling of the teams first to know the participants team, we wait until its done
        if (!this._teamsAvailable) {
            return setTimeout(() => {
                this.handleParticipants();
            }, 200);
        }
        
        const participants = this.matchData.info.participants;
        for (const participant of participants) {
            const teamId = participant.teamId;
            const participantId = participant.participantId;
            const name = participant.summonerName;
            const champion = participant.championId;
            const summonerSpell1 = participant.summoner1Id;
            const summonerSpell2 = participant.summoner2Id;
            const kills = participant.kills;
            const deaths = participant.deaths;
            const assists = participant.assists;
            const gold = participant.goldEarned;
            const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled;
            const damage = participant.totalDamageDealtToChampions;
            this.participants[participantId] = {
                participantId,
                teamId,
                name,
                champion,
                summonerSpell1,
                summonerSpell2,
                stats: {
                    kills,
                    deaths,
                    assists,
                    cs,
                    gold,
                    damage
                },
                items: [
                    participant.item0,
                    participant.item1,
                    participant.item2,
                    participant.item3,
                    participant.item4,
                    participant.item5,
                    participant.item6
                ]
            };
            this.teams[teamId].participants.push(participantId);
            this.teams[teamId].stats.kills += kills;
            this.teams[teamId].stats.deaths += deaths;
            this.teams[teamId].stats.assists += assists;
            this.teams[teamId].stats.gold += gold;
            this.teams[teamId].stats.damage += damage;
            

        }
        this._participantsAvailable = true;
        this._readyCheck();
    }
    handleTeams() {
        const teams = this.matchData.info.teams;
        function sumFeatStates(feats) {
            return Object.values(feats).reduce((total, featObj) => {
              return total + (featObj.featState || 0);
            }, 0);
          }

        this.gameDuration = this.matchData.info.gameDuration
        
        try{
        let feat_blue_value = sumFeatStates(teams[0].feats)
        let feat_red_value = sumFeatStates(teams[1].feats)

        this.featTeamId = feat_blue_value < feat_red_value ? 100 : 200
        } catch(error){
            console.log(error)
        }

        this.winnerTeamId = teams[0].win ? 100 : 200

        for (const team of teams) {
            const teamId = team.teamId;
            let bans = [];
            for (const ban of team.bans) {
                bans.push(ban.championId);
            }
            const barons = team.objectives.baron.kills;
            const inhibitors = team.objectives.inhibitor.kills;
            const towers = team.objectives.tower.kills;
            let horde = 0 
            let atakhan = 0
            let riftHerald = 0
            try { horde = team.objectives.horde.kills}
            catch { horde = 0}
            try { atakhan = team.objectives.atakhan.kills}
            catch { atakhan = 0}
            try { riftHerald = team.objectives.riftHerald.kills}
            catch { riftHerald = 0}
            
            this.teams[teamId] = {
                teamId,
                participants: [],
                stats: {
                    kills: 0,
                    deaths: 0,
                    assists: 0,
                    gold: 0,
                    damage: 0,
                    barons,
                    inhibitors,
                    towers,
                    horde,
                    atakhan,
                    riftHerald,
                    elders: 0
                },
                dragons: [],
                bans
            };
        }
        this._teamsAvailable = true;
        this._readyCheck();
    }
    handleTimeLine() {
        var _a, _b;
        // Since we need the handling of all participants first to know the participants team, we wait until its done
        if (!this._participantsAvailable) {
            return setTimeout(() => {
                this.handleTimeLine();
            }, 200);
        }
        if (((_b = (_a = this.timelineData) === null || _a === void 0 ? void 0 : _a.info) === null || _b === void 0 ? void 0 : _b.frames) === undefined) {
            this._goldFramesAvailable = true;
            this._readyCheck();
            return;
        }
        const frames = this.timelineData.info.frames;
        for (const frame of frames) {
            this._checkForDragonEvent(frame.events);
            this._checkEventTimeline(frame.events, frame.timestamp)
            this._calcFrameGold(Object.values(frame.participantFrames), frame.timestamp);
        }
        this._goldFramesAvailable = true;
        this._readyCheck();
    }
    _checkForDragonEvent(events) {
        for (const event of events) {
            if (event.type !== 'ELITE_MONSTER_KILL')
                continue;
            const typedEvent = event;
            if (typedEvent.monsterType !== Monster_1.MonsterType.DRAGON)
                continue;
            if (!typedEvent.monsterSubType)
                continue;
            if (typedEvent.monsterSubType === Monster_1.MonsterSubType.ELDER_DRAGON) {
                this.teams[typedEvent.killerTeamId].stats.elders++;
            }
            else {
                this.teams[typedEvent.killerTeamId].dragons.push(typedEvent.monsterSubType);
            }
        }
    }
    _calcFrameGold(participants, timestamp) {
        let blue = 0;
        let red = 0;
        for (const participant of participants) {
            const teamId = this.teams[100].participants.includes(participant.participantId)
                ? 100
                : 200;
            if (teamId == 100)
                blue += participant.totalGold;
            else if (teamId == 200)
                red += participant.totalGold;
        }
        this.goldFrames[timestamp] = blue - red;
    }
    // (function (MonsterType) {
    //     MonsterType["DRAGON"] = "DRAGON";
    //     MonsterType["RIFTHERALD"] = "RIFTHERALD";
    //     MonsterType["BARON_NASHOR"] = "BARON_NASHOR";
    // })(MonsterType || (exports.MonsterType = MonsterType = {}));
    // var MonsterSubType;
    // (function (MonsterSubType) {
    //     MonsterSubType["EARTH_DRAGON"] = "EARTH_DRAGON";
    //     MonsterSubType["WATER_DRAGON"] = "WATER_DRAGON";
    //     MonsterSubType["FIRE_DRAGON"] = "FIRE_DRAGON";
    //     MonsterSubType["AIR_DRAGON"] = "AIR_DRAGON";
    //     MonsterSubType["ELDER_DRAGON"] = "ELDER_DRAGON";
    // })(MonsterSubType || (exports.MonsterSubType = MonsterSubType = {}));
    _checkEventTimeline(events, timestamp){
        for (const event of events) {
            const typedEvent = event;
            if (typedEvent.type === 'ELITE_MONSTER_KILL')
                this.eventTimeline[event.timestamp] = [
                    typedEvent.killerTeamId,
                    typedEvent.monsterType,
                    typedEvent.monsterSubType,
                ]
            
            if (typedEvent.type === "BUILDING_KILL")
                this.eventTimeline[event.timestamp] = [
                    typedEvent.teamId, 
                    typedEvent.towerType    
                ]

        }
    }
}
exports.EndOfGameData = EndOfGameData;
//# sourceMappingURL=handleData.js.map