import { Component, h, Listen, Method, Prop, State } from '@stencil/core';

// o extend HTMLElement é feito pelo Stencil
// para dizer para o Stencil que é um component temos que adicionar um decorator @Component (tem que importar ele)
// temo que passar um objeto para o decorator
@Component({
  tag: 'uc-side-drawer',
  styleUrl: './side-drawer.css',
  // styles: `.h1 {...}` colocaríamos os styles inline
  // styleUrls podemos dar um array de arquivos de styles
  // scoped: true, os estilos devem ter o scope somente desse componente
  // :host para estilizar não funciona com o scoped, só com o shadow, teria que usar o component selector (uc-side-drawer)
  shadow: true, // já faz o polyfill para older browsers
})
// temos que exportar essa classe
export class SideDrawer {
  // State checa mudanças que vem de dentro do componente, roda o render caso algo mude, só as partes que mudaram
  // @State() showContactInfo: boolean;
  @State() showContactInfo = false; // typescript infere que é boolean

  // Prop faz o stencil ver atributos com esse nome de title no nosso componente, se mudar ele (via JS), Stencil detecta a mudança e roda o render de novo (renderiza novamente só o que precisa).
  // checa mudanças que vem de fora do componente.
  // { reflect: true } faz mudar o atributo no html, se houver alteração dinâmica nele
  @Prop({ reflect: true }) title: string;
  // só renderizar o componente se open for true (com a variável content)
  // sem essa variável, podemos usar o open no css para abrir e fechar o aside, não precisamos dessa property, mas se mantermos, o stencil vai checar ela ela.
  // sem o mutable, ele dá erro no console, dizendo que não podemos mudar o valor de open (podemos mudar de fora, mas não de dentro do componente)
  @Prop({ reflect: true, mutable: true }) opened: boolean;
  // essa prop era open, qd adicionamos o método open, renomeamos a prop para opened

  onCloseDrawer() {
    this.opened = false;
  }

  onContentChange(content: string) {
    // console.log(content);
    // se content === 'contact' isso é true, ou seja, showContactInfo = true, se não for vai ser false
    this.showContactInfo = content === 'contact';
  }

  // dessa forma não temos acesso a esse método fora do componente
  // temos que adicionar o decorator @Method
  @Method()
  open() {
    this.opened = true;
  }

  // Esc key fecha o side-drawer
  @Listen('keydown', { target: 'window' })
  closeDrawerKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.opened) {
      this.onCloseDrawer();
    }
  }

  // temos que ter o render method (tem que ter esse nome)
  render() {
    let mainContent = <slot />;
    // showContactInfo é true, muda para o setado abaixo, se não fica o que está no slot
    if (this.showContactInfo) {
      mainContent = (
        <div id="contact-information">
          <h2>Contact Information</h2>
          <p>You can reach us via phon or email.</p>
          <ul>
            <li>Phone: 123456789</li>
            <li>
              <a href="mailto:something@something.com">E-mail: something@something.com</a>
            </li>
          </ul>
        </div>
      );
    }

    // só renderiza o compoenente se open é true (existe na tag html, não precisa ser open="true", só open)
    // let content = null;
    // if (this.open) {
    //   content = (
    //     <aside>
    //       <header>
    //         <h1>{this.title}</h1>
    //       </header>
    //       <main>
    //         {/* <slot></slot> se só abrimos e fechamos, podemos escreve <slot/> */}
    //         <slot />
    //       </main>
    //     </aside>
    //   );
    // }

    // return content;

    return [
      // tem que ter somente um root element, não poderia ter duas divs irmãs, por exemplo
      // <div class="backdrop"></div> não funciona conforme linha acima explica
      // termos que retornar um array
      // coloquei os [] e uma virgula depois da primeira div (primeiro item do array)
      <div class="backdrop" onClick={this.onCloseDrawer.bind(this)}></div>,
      <aside>
        <header>
          <h1>{this.title}</h1>
          <button onClick={this.onCloseDrawer.bind(this)}>X</button>
        </header>
        <section id="tabs">
          <button class={!this.showContactInfo ? 'active' : ''} onClick={this.onContentChange.bind(this, 'nav')}>
            Navigation
          </button>
          <button class={this.showContactInfo ? 'active' : ''} onClick={this.onContentChange.bind(this, 'contact')}>
            Contact
          </button>
        </section>
        <main>
          {/* <slot></slot> se só abrimos e fechamos, podemos escreve <slot/> */}
          {/* <slot /> */}
          {/* isso só é válido em tsx ou jsx, não é válido no hmtl */}
          {mainContent}
        </main>
      </aside>,
    ];
    // no bind, o segundo argumento é o argumento que queremos passar para a função que estamos chamando o bind
  }
}
