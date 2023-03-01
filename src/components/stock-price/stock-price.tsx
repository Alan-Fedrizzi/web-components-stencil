import { Component, h, Listen, Prop, State, Watch } from '@stencil/core';
import { AV_API_KEY } from '../../global/global';

// Vamos usar uma API: https://www.alphavantage.co/
// Tem que se registrar para conseguir uma API key
// Welcome to Alpha Vantage! Here is your API key: 0XMTXI5Q8Y9PDM53.
// Quote Endpoit vai nos fornecer um objeto, ex:
/*
{
  "Global Quote": {
      "01. symbol": "IBM",
      "02. open": "129.6200",
      "03. high": "130.6700",
      "04. low": "129.2200",
      "05. price": "130.5700",
      "06. volume": "3015907",
      "07. latest trading day": "2023-02-24",
      "08. previous close": "130.7900",
      "09. change": "-0.2200",
      "10. change percent": "-0.1682%"
  }
}
*/

@Component({
  tag: 'uc-stock-price',
  styleUrl: './stock-price.scss',
  shadow: true,
})
export class StockPrice {
  // vai fazer referência ao nosso input no DOM, só temos que colocar o ref="" na tag html. Não precisa do @Prop()
  stockInput: HTMLInputElement;
  // initialStockSymbol: string;

  // @Element() temos que colocar na propriedade que fará referência ao nosso web component (host)
  // @Element() el: HTMLElement;
  // como colocamos o stockInput: HTMLInputElement; não vamos mais usar esse el

  @State() fetchedPrice: number;

  // update com cada keystroke, para, por ex, fazer validação
  // vamos salvar o que o usuário preenche em uma variável e atualizar o input com essa variável
  @State() stockUserInput: string;
  @State() stockInputValid = false;
  @State() error: string;

  // state para verificar se estamos loading ou não, para adicionar o spinner
  @State() loading = false;

  // setting stock symbol from outside
  @Prop({ reflect: true, mutable: true }) stockSymbol: string;

  // convenção é coloca ro método que ve a mudança na Prop logo abaixo dela
  @Watch('stockSymbol') // recebe a prop name como argumento (como string)
  stockSymbolChange(newValue: string, oldValue: string) {
    //qd essa propriedade recebe um novo valor, executa esse método
    if (newValue !== oldValue) {
      // update user input
      this.stockUserInput = newValue;
      // validação
      this.stockInputValid = true;
      //fetch
      this.fetchStockPrice(newValue);
    }
  }

  // component lifecycle na ordem que são executados:
  componentWillLoad() {
    console.log('Component will load...');
    console.log(this.stockSymbol); // já vai conseguir ler esse atributo no html, é antes de executar o render
    // se quisermos, aqui já podemos alterar as propriedades do componente
  }

  // se já tem o stockSymbol qd o componenete é criado (atributo no html), já vamos fazer o fetch
  // vamos usar um lifecycle: https://stenciljs.com/docs/component-lifecycle
  // na documentação já tem mais métodos do que ele fala no curso.
  componentDidLoad() {
    console.log('Component did update...');
    if (this.stockSymbol) {
      // this.initialStockSymbol = this.stockSymbol;
      // vamos colocar o symbol que está no atributo html no input
      this.stockUserInput = this.stockSymbol;
      // já vamos começar com o botão habilitado, pois teremos um input válido
      this.stockInputValid = true;
      this.fetchStockPrice(this.stockSymbol);
    }
    // se quisermos, podemos alterar as propriedades do componente, render vai rodar de novo, isso seria ineficiente
  }

  componentWillUpdate() {
    // executa antes do render qd o componente tem que ser atualizado
    console.log('Component will update...');
  }

  componentDidUpdate() {
    // executa depois do render qd o componente tem que ser atualizado
    console.log('Component did update...');
    // se não são iguais, significa que temos que atualizar, fetch a new price
    // if (this.stockSymbol !== this.initialStockSymbol) {
    //   this.initialStockSymbol = this.stockSymbol;
    //   this.fetchStockPrice(this.stockSymbol);
    //   this.stockUserInput = this.stockSymbol;
    // }
    // tem um jeito mais fácil de fazer isso
  }

  // componentDidUnload() { era chamado assim, agora é
  disconnectedCallback() {
    // qd o componenete é removido
    // pode ser usado para cleanupmap
    console.log('Component did unload...');
  }

  // a validação é feita em cada keystroke
  onUserInput(event: Event) {
    this.stockUserInput = (event.target as HTMLInputElement).value;
    // só vamos checar se o input está vazio, poderíamos fazer uma validação melhor
    // trim retira os white spaces
    // if (this.stockUserInput.trim().length > 0) {
    if (this.stockUserInput.trim() !== '') {
      this.stockInputValid = true;
    } else {
      this.stockInputValid = false;
    }
    // se o input não for válido vamos disable the button
  }

  @Listen('ucSymbolSelected', { target: 'body' })
  onStockSymbolSelected(event: CustomEvent) {
    // checar se detail existe e se é diferente ao atual
    if (event.detail && event.detail !== this.stockSymbol) {
      // this.fetchStockPrice(event.detail);
      // vamos mudar o stockSymbol, isso já faz o fetch (ver stockSymbolChange)
      this.stockSymbol = event.detail;
    }
  }

  fetchStockPrice(stockSymbol: string) {
    // mostrar spinner qd está loading
    this.loading = true;

    // http request
    // fetch pode precisar de polyfills para funcionar em older browsers, tem que avisar isso na docuentação do componente, para quem for usar ele saber.
    // vamos usar o demoa por enquanto
    // fetch retorna uma promise
    // fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo`)
    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${AV_API_KEY}`)
      .then(res => {
        // console.log(res.status);
        // se o usuário digitar um symbol inválido, retorna o objeto Global Quote vazio
        // 200 é status de sucesso;
        // mas nesse caso, mesmo sendo inválido, retorna status 200, essa API funciona assim
        if (res.status !== 200) {
          throw new Error('Invalid!');
        }
        // response vem no formato json
        return res.json(); // tranforma the incoming data em um JS object
      })
      .then(parsedRes => {
        // qd faz muitas requisições:
        // "Note": "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day. Please visit https://www.alphavantage.co/premium/ if you would like to target a higher API call frequency.
        if (parsedRes['Note']) {
          throw new Error('Please wait! Our standard API call frequency is 5 calls per minute and 500 calls per day');
        }

        // vamos checar se o Global Quote é um objeto com a propriedade do preço
        if (!parsedRes['Global Quote']['05. price']) {
          throw new Error('Invalid symbol!');
        }
        // se passar desse if, temos que voltar o erro para null
        this.error = null;

        console.log(parsedRes);
        // para acessar as propriedades desse objeto temos que usar [] e não dot notation, pois tem white space nos nomes
        this.fetchedPrice = +parsedRes['Global Quote']['05. price'];
        // aqui, this se refere ao que chamou o método, ou seja, não vai funcionar dessa forma
        // para funcionar, temos que colocar o bind no form, que chama essa função
        // console.log(this.fetchedPrice);

        // esconder spinner qd carrega os resultados
        this.loading = false;
      })
      .catch(err => {
        this.error = err.message;
        // se já temos um fetechedPrice válido, temos que mudar o valor para registrar o erro
        this.fetchedPrice = null;
        // esconder spinner qd carrega os resultados
        this.loading = false;
      });
  }

  // nesse método sempre vamos usar o que o usuário colocou no input
  onFetchStockPrice(event: Event) {
    event.preventDefault();
    // console.log('Submitted!');

    // para selecionar o input, não pode ser assim, o this se refere a classe, e ela não tem um método chamado querySelector
    // this.querySelector();
    // depois que definimos o el, podemos usar o querySelector, pois selecionamos o host
    // this.el.querySelector('#stock-symbol').value; não aceita o value, ele não sabe que é um input
    // const stockSymbol = (this.el.querySelector('#stock-symbol') as HTMLInputElement).value; assim tb não funciona pq temos shadow true, temos que usar o shadowRoot.
    // const stockSymbol = (this.el.shadowRoot.querySelector('#stock-symbol') as HTMLInputElement).value;
    // para testar, vamos colocar AAPL no input, é da apple -> Funcionou!!!
    // adicionamos o stockInput:
    // essa const stockSymbol não é a mesma @Prop da class
    // const stockSymbol = this.stockInput.value;
    // colocamos a this.stockSymbol como mutable
    this.stockSymbol = this.stockInput.value;

    // não precismaos mais do fetch aqui, vai ser chamado no Watch da Prop
    // this.fetchStockPrice(stockSymbol);
  }

  // é um método do stencil, retorna um objeto com informações da tag do custom element
  hostData() {
    // coloca essa classe qd renderiza o web component, qd executa o render, ou seja, qd algo muda tb
    // return { class: 'stock-price' };
    return { class: this.error ? 'stock-price stock-price--error' : 'stock-price' };
  }

  render() {
    const { fetchedPrice, onFetchStockPrice, stockUserInput, onUserInput, stockInputValid, loading } = this;
    // stockInput -> se colocar como const, não deixa usar o ref, diz que não podemos mudar o valor de uma cont

    // vamos mostrar para o usuário o erro ao invés de logar no console
    let dataContent = <p>Please enter a symbol!</p>;
    if (this.error) {
      dataContent = <p>{this.error}</p>;
    }
    if (this.fetchedPrice) {
      dataContent = <p>Price: ${fetchedPrice}</p>;
    }
    if (loading) {
      // para usar o uc-spinner não precisa importar nada, é um component html que está globalmente disponível nesse projeto
      dataContent = <uc-spinner></uc-spinner>;
    }

    return [
      <form onSubmit={onFetchStockPrice.bind(this)}>
        <input class="stock-price__input" id="stock-symbol" ref={el => (this.stockInput = el)} value={stockUserInput} onInput={onUserInput.bind(this)} />
        {/* qd está loading, vmaos dessabilitar o botão */}
        <button class="stock-price__button" type="submit" disabled={!stockInputValid || loading}>
          Fetch
        </button>
      </form>,
      // Vamos pegar um spinner pronto: https://loading.io/css/
      <div>{dataContent}</div>,
    ];
  }
}
