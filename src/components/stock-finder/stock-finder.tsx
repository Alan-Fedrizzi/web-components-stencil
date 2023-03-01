import { Component, h, State, Event, EventEmitter } from '@stencil/core';
import { AV_API_KEY } from '../../global/global';

@Component({
  tag: 'uc-stock-finder',
  styleUrl: './stock-finder.scss',
  shadow: true,
})
export class StockFinder {
  stockNameInput: HTMLInputElement;

  // vamosinicializar com um empity array, para ser um array e não undefined qd carrega a página (chamamos o .map nessa proprieadede no web component)
  @State() searchResults: { symbol: string; name: string }[] = [];

  // spinner
  @State() loading = false;

  // custom events
  // vai emitir uma string, que será o nome o symbol
  @Event({ bubbles: true, composed: true }) ucSymbolSelected: EventEmitter<string>;

  onFindStocks(event: Event) {
    event.preventDefault();
    // spinner
    this.loading = true;

    const stockName = this.stockNameInput.value;
    // request api
    fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stockName}&apikey=${AV_API_KEY}`)
      .then(res => res.json())
      .then(parsedRes => {
        // console.log(parsedRes['bestMatches']);
        this.searchResults = parsedRes['bestMatches'].map(match => {
          return { symbol: match['1. symbol'], name: match['2. name'] };
        });
        // console.log(this.searchResults);

        // spinner
        this.loading = false;
      })
      .catch(err => {
        console.log(err);
        // spinner
        this.loading = false;
      });
  }

  // vamos fazer que qd clica em algum item da lista, emite um custom event e atualiza o preço automaticamente
  onSelectSymbol(symbol: string) {
    // vamos emitir nosso custom event aqui, com o symbol
    this.ucSymbolSelected.emit(symbol);
  }

  // é um método do stencil, retorna um objeto com informações da tag do custom element
  hostData() {
    // coloca essa classe qd renderiza o web component
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
      // lista dos resultados ou spinner
      content,
    ];
  }
}
