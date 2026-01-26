import React from 'react'
import cx from 'classnames'
import Pick from './Pick'

import css from './style/index.less'
import Ban from './Ban'

export default class Overlay extends React.Component {
  state = {
    currentAnimationState: css.TheAbsoluteVoid,
    openingAnimationPlayed: false
  }

  playOpeningAnimation() {
    this.setState({ openingAnimationPlayed: true })
    setTimeout(() => {
      this.setState({ currentAnimationState: css.AnimationHidden })
      setTimeout(() => {
        this.setState({
          currentAnimationState: css.AnimationTimer + ' ' + css.AnimationBansPick
        })
        setTimeout(() => {
          this.setState({
            currentAnimationState: css.AnimationBansPick + ' ' + css.AnimationBansPickOnly
          })
          setTimeout(() => {
            this.setState({ currentAnimationState: css.AnimationPigs })
          }, 1000)
        }, 1450)
      }, 700)
    }, 500)
  }

  render() {
    const { state, config } = this.props

    if (state.isActive && !this.state.openingAnimationPlayed) {
      this.playOpeningAnimation()
    }

    if (!state.isActive && this.state.openingAnimationPlayed) {
      this.setState({ openingAnimationPlayed: false })
      this.setState({ currentAnimationState: css.TheAbsoluteVoid })
    }

    const renderBans = (teamState) => (
      <div className={cx(css.BansContainer)}>
        {teamState.bans.map((ban, idx) => (
          <div key={`ban-slot-${idx}`} className={css.BanSlot}>
            <Ban {...ban} />
          </div>
        ))}
      </div>
    );
    const renderTeam = (teamName, teamConfig, teamState) => (
      <div className={cx(css.Team, teamName)}>
        <div className={cx(css.Picks)}>
          {teamState.picks.map((pick) => (
            <Pick config={this.props.config} {...pick} showSummoners={state.showSummoners} />
          ))}
        </div>
        <div className={css.BansWrapper}>
          <div className={cx(css.Bans, { [css.WithScore]: config.frontend.scoreEnabled })}>
            {teamName === css.TeamBlue && config.frontend.scoreEnabled && (
              <div className={css.TeamScore}>{teamConfig.score}</div>
            )}
            <div className={cx(css.Bans, { [css.WithScore]: config.frontend.scoreEnabled })}>
              {renderBans(teamState)}
            </div>            
            {teamName === css.TeamRed && config.frontend.scoreEnabled && (
              <div className={css.TeamScore}>{teamConfig.score}</div>
            )}
          </div>
        </div>
      </div>
    )

    return (
      <>
        <div className={cx(css.Overlay, css.Europe, this.state.currentAnimationState)}>
          {Object.keys(state).length !== 0 && (
            <div className={cx(css.ChampSelect)}>
              
              {/* --- TIMER CORRIGÉ --- */}
              {/* Placé ici pour être au-dessus de tout et centré sur l'écran global */}
              <div className={cx(css.Timer)}>
                  <div className={cx(css.TimerLeft)}>{state.timer || "0"}</div>
                  <div className={cx(css.TimerRight)}>{state.timer || "0"}</div>
              </div>
              {/* --------------------- */}

              <div className={cx(css.MiddleBox)}>
                <div className={cx(css.CenterLogo)}>
                  <img src="/pages/op-plugin-theming/active/logo.png" alt="" />
                </div>                
                <div className={cx(css.Patch)}>
                  {state.state}
                </div>
              </div>

              {renderTeam(css.TeamBlue, config.frontend.blueTeam, state.blueTeam)}
              {renderTeam(css.TeamRed, config.frontend.redTeam, state.redTeam)}
            </div>
          )}
        </div>
      </>
    )
  }
}