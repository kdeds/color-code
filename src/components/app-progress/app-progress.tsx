import { Component, Element, h, State } from '@stencil/core';
import challengeJson from '../../assets/challenges/challengeData.json';
import { Router } from '../..';

@Component({
  tag: 'app-progress',
  styleUrl: 'app-progress.scss',
  shadow: true,
})
export class AppProgress {
  @Element() el;
  @State() completedLevels: string[] = [];
  @State() forceRender: number = 0;

  componentWillLoad() {
    this.completedLevels = localStorage.getItem('color-code-completed-challenges')?.split(',');
  }

  render() {
    return (
      <div class="app-progress">
        <h3>Progress</h3>
        <div class="challenges">
          Jump to: {` `}
          <a onClick={() => this.el.shadowRoot.getElementById('junior').scrollIntoView({behavior: 'smooth'})}>Junior</a> |{` `}
          <a onClick={() => this.el.shadowRoot.getElementById('expert').scrollIntoView({behavior: 'smooth'})}>Expert</a> | {` `}
          <a onClick={() => this.el.shadowRoot.getElementById('master').scrollIntoView({behavior: 'smooth'})}>Master</a>
          <table>
            <tr>
              <th>Challenge</th>
              <th>Status</th>
              <th></th>
            </tr>
          {Object.keys(challengeJson).map(challenge => {
            let challengeObj = challengeJson[challenge];
            let complete = this.completedLevels.includes(challengeObj['id']);
            let jumplink = null;
            
            if (challengeObj['id'] == '26') {
              jumplink = "junior";
            }
            if(challengeObj['id'] == '51') {
              jumplink = 'expert';
            }
            if(challengeObj['id'] == '76') {
              jumplink = 'master';
            }

            return <tr>
              <td>{jumplink && <a id={jumplink}></a>}{challengeObj['level']} {challengeObj['id']}</td>
              <td>{complete ? 'Completed' : '-' }</td>
              <td><button class={complete ? 'replay' : 'play'} onClick={() => Router.push(`/challenges/${challengeObj['id']}`)}>{complete ? 'Replay' : 'Play'}</button></td>
            </tr>
          })}
          </table>
         
        </div>


        {/* <button
          onClick={() => Router.push('/profile/stencil')}
        >
        </button> */}
      </div>
    );
  }
}
