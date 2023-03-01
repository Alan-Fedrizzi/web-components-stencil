import { Component, h } from '@stencil/core';

@Component({
  tag: 'uc-spinner',
  styleUrl: './spinner.scss',
  shadow: true,
})
export class Spinner {
  render() {
    return (
      <div class="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }
}
