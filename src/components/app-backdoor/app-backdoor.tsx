import { Component, Element, h, State } from '@stencil/core';

@Component({
  tag: 'app-backdoor',
  styleUrl: 'app-backdoor.scss',
  shadow: true,
})
export class AppBackdoor {
  @Element() el;
  @State() completedLevels: string[] = [];
  @State() forceRender: number = 0;
  @State() lastCompletedStatus: string = '';

  componentWillLoad() {
  
  }

  setLastCompletedLevel() {
    let lastCompleted = parseInt(this.el.shadowRoot.querySelector('[name="lastCompleted"]').value);
    // generate array
    let levels = [];
    for(let i=1; i<=lastCompleted; i++) {
      levels.push(i.toString().padStart(2, '0'));
    }
    localStorage.setItem('color-code-completed-challenges', levels.join(','));
    this.lastCompletedStatus = "Done";
  }
  
  render() {
    return (
      <div class="app-backdoor">
        <h2>Utilities</h2>
       <strong>Set last completed level:</strong> <input type="number" name="lastCompleted" /> <button onClick={() => this.setLastCompletedLevel()}>&#10003;</button> {this.lastCompletedStatus}
      </div>
    );
  }
}
