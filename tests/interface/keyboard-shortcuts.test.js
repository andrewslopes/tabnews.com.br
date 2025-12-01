import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import useKeyboardShortcuts from 'pages/interface/hooks/useKeyboardShortcuts';

const mockPush = vi.fn();

vi.mock('next/router', () => {
  return {
    useRouter: () => ({
      push: mockPush,
    }),
  };
});

describe('Keyboard shortcuts - Ciclo 1: Atalho de pesquisa', () => {
  function TestComponent({ onSearchClick = () => {} } = {}) {
    useKeyboardShortcuts();

    return (
      <div>
        <button aria-label="Pesquisar" onClick={onSearchClick}>
          Pesquisar
        </button>

        <input aria-label="Campo de texto" />
      </div>
    );
  }

  it('deve acionar a pesquisa ao pressionar "/" fora de campos de entrada', () => {
    const handleSearchClick = vi.fn();
    render(<TestComponent onSearchClick={handleSearchClick} />);

    const event = new KeyboardEvent('keydown', {
      key: '/',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(handleSearchClick).toHaveBeenCalledTimes(1);
  });

  it('não deve acionar a pesquisa ao pressionar "/" dentro de um campo de entrada', async () => {
    const handleSearchClick = vi.fn();
    render(<TestComponent onSearchClick={handleSearchClick} />);

    const input = screen.getByLabelText('Campo de texto');
    input.focus();

    // Aguarda um tick para garantir que o foco foi aplicado
    await new Promise((resolve) => setTimeout(resolve, 0));

    const event = new KeyboardEvent('keydown', {
      key: '/',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(handleSearchClick).not.toHaveBeenCalled();
  });
});

describe('Keyboard shortcuts - Ciclo 2: Navegação entre posts', () => {
  function TestComponent({ onSearchClick = () => {} } = {}) {
    useKeyboardShortcuts();

    return (
      <div>
        <button aria-label="Pesquisar" onClick={onSearchClick}>
          Pesquisar
        </button>

        <a href="/post/1" data-keyboard-nav="content-link">
          Post 1
        </a>
        <a href="/post/2" data-keyboard-nav="content-link">
          Post 2
        </a>
        <a href="/post/3" data-keyboard-nav="content-link">
          Post 3
        </a>

        <input aria-label="Campo de texto" />
      </div>
    );
  }

  it('deve navegar entre os posts com "j" e "k"', () => {
    render(<TestComponent />);

    const eventJ1 = new KeyboardEvent('keydown', {
      key: 'j',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(eventJ1);
    expect(document.activeElement.textContent).toBe('Post 1');

    const eventJ2 = new KeyboardEvent('keydown', {
      key: 'j',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(eventJ2);
    expect(document.activeElement.textContent).toBe('Post 2');

    const eventK = new KeyboardEvent('keydown', {
      key: 'k',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(eventK);
    expect(document.activeElement.textContent).toBe('Post 1');
  });

  it('deve navegar entre os posts com as setas para cima e para baixo', () => {
    render(<TestComponent />);

    const eventDown1 = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(eventDown1);
    expect(document.activeElement.textContent).toBe('Post 1');

    const eventDown2 = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(eventDown2);
    expect(document.activeElement.textContent).toBe('Post 2');

    const eventUp = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(eventUp);
    expect(document.activeElement.textContent).toBe('Post 1');
  });

  it('não deve navegar além do primeiro post com "k" ou seta para cima', () => {
    render(<TestComponent />);

    const eventK = new KeyboardEvent('keydown', {
      key: 'k',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(eventK);
    expect(document.activeElement.textContent).toBe('Post 1');

    const eventUp = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(eventUp);
    expect(document.activeElement.textContent).toBe('Post 1');
  });

  it('não deve navegar além do último post com "j" ou seta para baixo', () => {
    render(<TestComponent />);

    const eventJ1 = new KeyboardEvent('keydown', { key: 'j', bubbles: true, cancelable: true });
    window.dispatchEvent(eventJ1);
    const eventJ2 = new KeyboardEvent('keydown', { key: 'j', bubbles: true, cancelable: true });
    window.dispatchEvent(eventJ2);
    const eventJ3 = new KeyboardEvent('keydown', { key: 'j', bubbles: true, cancelable: true });
    window.dispatchEvent(eventJ3);
    expect(document.activeElement.textContent).toBe('Post 3');

    const eventDown = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(eventDown);
    expect(document.activeElement.textContent).toBe('Post 3');
  });
});

describe('Keyboard shortcuts - Ciclo 3: Ajuda e novo conteúdo', () => {
  function TestComponent() {
    const { KeyboardShortcutsOverlay } = useKeyboardShortcuts();

    return (
      <div>
        <button aria-label="Pesquisar">Pesquisar</button>
        <input aria-label="Campo de texto" />
        <KeyboardShortcutsOverlay />
      </div>
    );
  }

  it('deve exibir a ajuda de atalhos ao pressionar "?"', async () => {
    render(<TestComponent />);

    const event = new KeyboardEvent('keydown', {
      key: '?',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog', {
        name: /Atalhos de teclado/i,
      });
      expect(dialog).toBeTruthy();
      expect(dialog).not.toBeNull();
    });
  });

  it('deve exibir a ajuda de atalhos ao pressionar "Shift + /"', async () => {
    render(<TestComponent />);

    const event = new KeyboardEvent('keydown', {
      key: '/',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog', {
        name: /Atalhos de teclado/i,
      });
      expect(dialog).toBeTruthy();
      expect(dialog).not.toBeNull();
    });
  });

  it('deve redirecionar para /publicar ao pressionar "N"', () => {
    mockPush.mockClear();
    render(<TestComponent />);

    const event = new KeyboardEvent('keydown', {
      key: 'N',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(mockPush).toHaveBeenCalledWith('/publicar');
  });

  it('deve redirecionar para /publicar ao pressionar "n" (minúsculo)', () => {
    mockPush.mockClear();
    render(<TestComponent />);

    const event = new KeyboardEvent('keydown', {
      key: 'n',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(mockPush).toHaveBeenCalledWith('/publicar');
  });

  it('não deve redirecionar ao pressionar "N" dentro de um campo de entrada', async () => {
    mockPush.mockClear();
    render(<TestComponent />);

    const eventOutside = new KeyboardEvent('keydown', {
      key: 'N',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(eventOutside);
    expect(mockPush).toHaveBeenCalledWith('/publicar');

    mockPush.mockClear();
    const input = screen.getByLabelText('Campo de texto');
    input.focus();

    await new Promise((resolve) => setTimeout(resolve, 0));

    const eventInside = new KeyboardEvent('keydown', {
      key: 'N',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(eventInside);

    expect(mockPush).not.toHaveBeenCalled();
  });
});
