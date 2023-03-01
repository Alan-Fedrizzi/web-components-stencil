import { Component, h, State, Event, EventEmitter } from '@stencil/core';
import { AV_API_KEY } from '../../global/global';

@Component({
  tag: 'uc-stock-finder',
  styleUrl: './stock-finder.scss',
  shadow: true,
})
export class StockFinder {
  stockNameInput: HTMLInputElement;

  @State() searchResults: { symbol: string; name: string }[] = [];
  @State() loading = false;

  @Event({ bubbles: true, composed: true }) ucSymbolSelected: EventEmitter<string>;

  onFindStocks(event: Event) {
    event.preventDefault();
    this.loading = true;

    const stockName = this.stockNameInput.value;
    fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stockName}&apikey=${AV_API_KEY}`)
      .then(res => res.json())
      .then(parsedRes => {
        this.searchResults = parsedRes['bestMatches'].map(match => {
          return { symbol: match['1. symbol'], name: match['2. name'] };
        });
        this.loading = false;
      })
      .catch(err => {
        console.log(err);
        this.loading = false;
      });
  }

  onSelectSymbol(symbol: string) {
    this.ucSymbolSelected.emit(symbol);
  }

  hostData() {
    return { class: 'stock-finder' };
  }

  render() {
    const { searchResults, onFindStocks, onSelectSymbol, loading } = this;

    let content = (
      <ul class="stock-finder__list">
        {searchResults.map(result => (
          <li class="stock-finder__item" onClick={onSelectSymbol.bind(this, result.symbol)}>
            <span class="stock-finder__symbol"> {result.symbol} </span>- {result.name}
          </li>
        ))}
      </ul>
    );
    if (loading) {
      content = <uc-spinner></uc-spinner>;
    }

    return [
      <form onSubmit={onFindStocks.bind(this)}>
        <input class="stock-finder__input" id="stock-symbol" ref={el => (this.stockNameInput = el)} />
        <button class="stock-finder__button" type="submit">
          Find
        </button>
      </form>,
      content,
    ];
  }
}
