import { Component, h, Listen, Prop } from '@stencil/core';

@Component({
  tag: 'my-tooltip',
  styleUrl: 'my-tooltip.scss',
  shadow: true,
})
export class MyTooltip {
  @Prop({ reflect: true }) text: string;
  @Prop({ reflect: true, mutable: true }) show = false;

  showTooltip() {
    this.show = true;
  }

  hideTooltip() {
    this.show = false;
  }

  @Listen('keydown', { target: 'window' })
  hideTooltipKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.show) {
      this.hideTooltip();
    }
  }

  render() {
    const { text, showTooltip, hideTooltip } = this;

    return [
      <div class="backdrop" onClick={hideTooltip.bind(this)}></div>,
      <div class="my-tooltip">
        <slot name="label"></slot>
        <div class="my-tooltip__container">
          <div class="my-tooltip__icon" onClick={showTooltip.bind(this)}>
            ?
          </div>
          <div class="my-tooltip__text">{text}</div>
        </div>
      </div>,
    ];
  }
}
