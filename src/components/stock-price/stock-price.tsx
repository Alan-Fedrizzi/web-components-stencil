import { Component, h, Listen, Prop, State, Watch } from '@stencil/core';
import { AV_API_KEY } from '../../global/global';

@Component({
  tag: 'uc-stock-price',
  styleUrl: './stock-price.scss',
  shadow: true,
})
export class StockPrice {
  stockInput: HTMLInputElement;
  @State() fetchedPrice: number;
  @State() stockUserInput: string;
  @State() stockInputValid = false;
  @State() error: string;
  @State() loading = false;
  @Prop({ reflect: true, mutable: true }) stockSymbol: string;

  @Watch('stockSymbol')
  stockSymbolChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.stockUserInput = newValue;
      this.stockInputValid = true;
      this.fetchStockPrice(newValue);
    }
  }

  componentDidLoad() {
    console.log('Component did update...');
    if (this.stockSymbol) {
      this.stockUserInput = this.stockSymbol;
      this.stockInputValid = true;
      this.fetchStockPrice(this.stockSymbol);
    }
  }

  onUserInput(event: Event) {
    this.stockUserInput = (event.target as HTMLInputElement).value;

    if (this.stockUserInput.trim() !== '') {
      this.stockInputValid = true;
    } else {
      this.stockInputValid = false;
    }
  }

  @Listen('ucSymbolSelected', { target: 'body' })
  onStockSymbolSelected(event: CustomEvent) {
    if (event.detail && event.detail !== this.stockSymbol) {
      this.stockSymbol = event.detail;
    }
  }

  fetchStockPrice(stockSymbol: string) {
    this.loading = true;

    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${AV_API_KEY}`)
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Invalid!');
        }
        return res.json();
      })
      .then(parsedRes => {
        if (parsedRes['Note']) {
          throw new Error('Please wait! Our standard API call frequency is 5 calls per minute and 500 calls per day');
        }
        if (!parsedRes['Global Quote']['05. price']) {
          throw new Error('Invalid symbol!');
        }
        this.error = null;

        console.log(parsedRes);
        this.fetchedPrice = +parsedRes['Global Quote']['05. price'];

        this.loading = false;
      })
      .catch(err => {
        this.error = err.message;
        this.fetchedPrice = null;
        this.loading = false;
      });
  }

  onFetchStockPrice(event: Event) {
    event.preventDefault();
    this.stockSymbol = this.stockInput.value;
  }

  hostData() {
    return { class: this.error ? 'stock-price stock-price--error' : 'stock-price' };
  }

  render() {
    const { fetchedPrice, onFetchStockPrice, stockUserInput, onUserInput, stockInputValid, loading } = this;
    let dataContent = <p>Please enter a symbol!</p>;
    if (this.error) {
      dataContent = <p>{this.error}</p>;
    }
    if (this.fetchedPrice) {
      dataContent = <p>Price: ${fetchedPrice}</p>;
    }
    if (loading) {
      dataContent = <uc-spinner></uc-spinner>;
    }

    return [
      <form onSubmit={onFetchStockPrice.bind(this)}>
        <input class="stock-price__input" id="stock-symbol" ref={el => (this.stockInput = el)} value={stockUserInput} onInput={onUserInput.bind(this)} />
        <button class="stock-price__button" type="submit" disabled={!stockInputValid || loading}>
          Fetch
        </button>
      </form>,
      <div>{dataContent}</div>,
    ];
  }
}
