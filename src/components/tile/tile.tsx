import { Component, Element, Event, Method, Prop, Watch, h } from '@stencil/core';

@Component({
  tag: 'cc-tile',
  styleUrl: 'tile.scss',
  shadow: true,
})
export class Tile {
  @Element() el;
  @Prop({ reflect: true }) tileId: string;
  @Prop() tileName: string;
  @Prop() tileImage: string;
  @Prop() tileSize: string;
  @Prop({mutable: true, reflect: true}) selected: boolean = false;

  @Prop({ mutable: true, reflect: true }) variant: string;

  @Prop({mutable: true}) rotation: number = 0;
  @Prop({mutable: true, reflect: true}) zIndex: number = 0;

  @Event({
    eventName: 'cc-tile-clicked',
  })
  tileClickedEvent;

  handleButtonClick() {
    if (this.variant == 'button') {
      window.setTimeout(() => {
        this.tileClickedEvent.emit(this.tileId);
        this.variant = 'canvas';
        this.el.setAttribute('slot', 'canvas-tile');
      }, 150);
    }

    if(this.variant == "button-small") {
      this.tileClickedEvent.emit(this.tileId);
    }
  }

  @Method()
  rotateLeft() {
    this.rotation -= 90;
    if(this.rotation == -360) {
      this.rotation = 0;
    }
    return Promise.resolve();
  }

  @Method()
  rotateRight() {
    this.rotation += 90;
    if(this.rotation == 360) {
      this.rotation = 0;
    }
    return Promise.resolve();
  }

  @Watch('zIndex')
  sendBackward() {
    this.el.style.zIndex = this.zIndex;
  }

  @Method()
  removeFromCanvas() {
    this.el.setAttribute('slot', 'available-tile');
    this.variant = 'button';
    return Promise.resolve();
  }


  render() {
    return (
      <div class={`tile rotate-${Math.abs(this.rotation)} ${this.rotation < 0 ? 'rotate-left' : 'rotate-right'}`}>
        {this.variant == 'button' || this.variant == 'button-small' ? (
          <button onClick={this.handleButtonClick.bind(this)} title={this.tileName}>
            <img src={this.tileImage} />
          </button>
        ) : (
          <img src={this.tileImage} title={this.tileName} />
        )}
      </div>
    );
  }
}
