import { Component, Element, Fragment, h, Listen, Prop, State, Watch } from '@stencil/core';
// import { Router } from "../../";
import tileJson from '../../assets/tiles/tiles.json';
import challengeJson from '../../assets/challenges/challengeData.json';
import { Router } from '../..';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.scss',
  shadow: true,
})
export class AppHome {
  @Element() el;
  @State() selectedTileId: string;
  private currentTilesRef: HTMLDivElement;
  private selectedTileRef: HTMLCcTileElement;
  @State() canvasTiles: string[] = [];
  @State() forceRender: number = 0;
  @Prop() challenge: string;
  @Prop({ mutable: true }) challengeImage: string;
  @State() completed: boolean;
  @State() completionString: string = '';
  @Prop({ mutable: true }) autoplay: boolean = false;
  private autoplayTimeout: number;

  componentWillLoad() {
    this.initializeChallenge();
  }

  initializeChallenge() {
    if (this.el.children.length === 0) {
      Object.keys(tileJson).forEach(tile => {
        let tileEl = document.createElement('cc-tile');
        tileEl.setAttribute('slot', 'available-tile');
        tileEl.setAttribute('tile-id', tile);
        tileEl.setAttribute('tile-name', tileJson[tile]['name']);
        tileEl.setAttribute('tile-image', tileJson[tile]['image']);
        tileEl.setAttribute('variant', 'button');
        this.el.appendChild(tileEl);
      });
    }

    if (localStorage.getItem('color-code-autoplay')) {
      this.autoplay = localStorage.getItem('color-code-autoplay') == 'true';
    } else {
      this.enableAutoplay(); // default
    }

    this.challengeImage = challengeJson[`challenge-${this.challenge}`]['image'];
  }

  @Watch('challenge')
  resetChallenge() {
    this.el.innerHTML = '';
    this.canvasTiles = [];
    this.selectedTileId = '';
    this.completed = false;
    this.completionString = '';
    this.initializeChallenge();
  }

  @Listen('cc-tile-clicked')
  handleTileClicked(e) {
    let clickedTile = e.composedPath()[0];
    if (clickedTile.getAttribute('variant') == 'button-small') {
      window.setTimeout(() => {
        this.currentTilesRef.querySelectorAll('cc-tile').forEach(tile => tile.removeAttribute('selected'));
        this.selectedTileId = clickedTile.getAttribute('tile-id');
        this.currentTilesRef.querySelector(`[tile-id="${this.selectedTileId}"]`)?.setAttribute('selected', 'selected');
      }, 150);
    }

    if (clickedTile.getAttribute('variant') == 'button') {
      this.canvasTiles = [...this.canvasTiles, clickedTile.getAttribute('tile-id')];
      window.setTimeout(() => {
        this.selectedTileId = clickedTile.tileId;
        clickedTile.setAttribute('z-index', this.currentTilesRef.querySelectorAll('ol li').length);
      }, 150);
    }
  }

  handleAvailableTiles() {}

  handleCanvasTiles() {}

  handleRotateLeft() {
    this.selectedTileRef.rotateLeft();
  }

  handleRotateRight() {
    this.selectedTileRef.rotateRight();
  }

  handleSendBackward() {
    let oldIndex = this.canvasTiles.indexOf(this.selectedTileRef.tileId);

    if (oldIndex > 0) {
      // Remove the item from its current position
      let removedItem = this.canvasTiles.splice(oldIndex, 1)[0];
      // Insert the item at the new desired position
      this.canvasTiles.splice(oldIndex - 1, 0, removedItem);
    }

    this.setZIndexes();

    this.forceRender = Math.random();
  }

  handleBringForward() {
    let oldIndex = this.canvasTiles.indexOf(this.selectedTileRef.tileId);

    if (oldIndex < this.canvasTiles.length) {
      // Remove the item from its current position
      let removedItem = this.canvasTiles.splice(oldIndex, 1)[0];
      // Insert the item at the new desired position
      this.canvasTiles.splice(oldIndex + 1, 0, removedItem);
    }

    this.setZIndexes();

    this.forceRender = Math.random();
  }

  setZIndexes() {
    this.canvasTiles.forEach((tileId, index) => {
      this.el.querySelector(`[tile-id="${tileId}"][slot="canvas-tile"]`)?.setAttribute('z-index', index);
    });
  }

  handleRemove() {
    let oldIndex = this.canvasTiles.indexOf(this.selectedTileRef.tileId);
    this.canvasTiles.splice(oldIndex, 1)[0];
    this.selectedTileRef.removeFromCanvas();

    this.selectedTileId = this.canvasTiles[this.canvasTiles.length - 1];
  }

  @Watch('selectedTileId')
  handleSelectedTileChanged() {
    this.selectedTileRef = this.el.querySelector(`[tile-id="${this.selectedTileId}"][slot="canvas-tile"]`);
  }

  handleSolutionCheck() {
    let solutionTiles = challengeJson[`challenge-${this.challenge}`]['tiles'];
    let isCompleted = false;
    if (this.canvasTiles.join(',') == solutionTiles.join(',')) {
      isCompleted = true;
    } else if (challengeJson[`challenge-${this.challenge}`]['alternateSolutions'] && challengeJson[`challenge-${this.challenge}`]['alternateSolutions'].length > 0) {
      challengeJson[`challenge-${this.challenge}`]['alternateSolutions'].forEach(altSolution => {
        if (this.canvasTiles.join(',') == altSolution.join(',')) {
          isCompleted = true;
        }
      });
    }

    if (isCompleted) {
      let completedChallenges = localStorage.getItem('color-code-completed-challenges')?.split(',') || [];
      completedChallenges.push(this.challenge);
      localStorage.setItem('color-code-completed-challenges', completedChallenges.sort().join(','));
      this.completed = true;
      this.completionString = 'Correct! Challenge complete';
      if (this.autoplay) {
        this.autoplayTimeout = window.setTimeout(() => {
          Router.push(`/challenges/${(parseInt(this.challenge) + 1).toString().padStart(2, '0')}`);
        }, 3000);
      }
    } else {
      this.completionString = 'Keep trying...';
      window.setTimeout(() => {
       this.completionString = '';
      }, 3000);
    }
  }

  goToPrevChallenge() {
    let okToMoveOn = this.completed || this.currentTilesRef.querySelectorAll('ol li').length == 0 || confirm('Are you sure? You will lose all progress on this challenge');
    if (okToMoveOn) {
      Router.push(`/challenges/${(parseInt(this.challenge) - 1).toString().padStart(2, '0')}`);
    }
  }

  goToNextChallenge() {
    let okToMoveOn = this.completed || this.currentTilesRef.querySelectorAll('ol li').length == 0 || confirm('Are you sure? You will lose all progress on this challenge');
    if (okToMoveOn) {
      Router.push(`/challenges/${(parseInt(this.challenge) + 1).toString().padStart(2, '0')}`);
    }
  }

  disableAutoplay() {
    localStorage.setItem('color-code-autoplay', 'false');
    this.autoplay = localStorage.getItem('color-code-autoplay') == 'true';
    window.clearTimeout(this.autoplayTimeout);
  }

  enableAutoplay() {
    localStorage.setItem('color-code-autoplay', 'true');
    this.autoplay = localStorage.getItem('color-code-autoplay') == 'true';
  }

  render() {
    return (
      <div class="app-home">
        <h3>Tile Gallery</h3>
        <div class="tiles">
          <slot name="available-tile" onSlotchange={this.handleAvailableTiles.bind(this)} />
        </div>

        <div class="canvas-container">
          <div class="canvas">
            <slot name="canvas-tile" onSlotchange={this.handleCanvasTiles.bind(this)}>
              <img src="/assets/tiles/00.svg" width="250" height="250" />
            </slot>
            <div class="controls">
              <button onClick={this.handleRotateLeft.bind(this)} title="Rotate Left">
                &#8624;
              </button>
              <button onClick={this.handleRotateRight.bind(this)} title="Rotate Right">
                &#8625;
              </button>
              <button onClick={this.handleBringForward.bind(this)} title="Bring Forward">
                &#10515;
              </button>
              <button onClick={this.handleSendBackward.bind(this)} title="Send Backward">
                &#10514;
              </button>
              <button onClick={this.handleRemove.bind(this)} title="Remove">
                &times;
              </button>
              <button onClick={this.handleSolutionCheck.bind(this)} title="Check Solution" class="check">
                &#10003;
              </button>
            </div>
            <div class={`solution ${this.completed ? '' : 'hidden'}`}>
              <h4>{this.completionString}</h4>
              {this.autoplay && this.completed && (
                <Fragment>
                  <h5>Autoplaying next level...</h5>
                  <button
                    onClick={() => {
                      this.disableAutoplay();
                    }}
                  >
                    Disable Autoplay
                  </button>
                </Fragment>
              )}
              {!this.autoplay && this.completed && (
                <button
                  onClick={() => {
                    this.enableAutoplay();
                  }}
                >
                  Enable Autoplay
                </button>
              )}
            </div>
          </div>
          <div class="current-tiles" ref={el => (this.currentTilesRef = el)}>
            <ol>
              {this.canvasTiles.map(tile => {
                return (
                  <li key={Math.random()}>
                    <cc-tile variant="button-small" tile-id={tile} tile-image={tileJson[tile]['image']} tile-name={tileJson[tile]['name']} selected={tile == this.selectedTileId} />
                  </li>
                );
              })}
            </ol>
          </div>
          <div class="challenge">
            <img src={this.challengeImage} />
            <div class="challenge-controls">
              <button onClick={this.goToPrevChallenge.bind(this)} disabled={this.challenge == '01'} title="Previous Challenge">
                {'<'}
              </button>
              <h4>{`${challengeJson[`challenge-${this.challenge}`]['level']} - ${this.challenge}`}</h4>
              <button onClick={this.goToNextChallenge.bind(this)} disabled={this.challenge == '100'} title="Next Challenge">
                {'>'}
              </button>
            </div>
          </div>
        </div>
          {!this.completed && <h4 class="keep-trying">{this.completionString}</h4>}
      </div>
    );
  }
}
