import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import { Box } from '@/TabNewsUI';

function isTypingElement(target) {
  if (!target) return false;

  const tagName = target.tagName?.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true;

  if (target.isContentEditable) return true;

  return false;
}

export default function useKeyboardShortcuts() {
  const router = useRouter();
  const currentIndexRef = useRef(-1);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      const { key } = event;

      let target = event.target;
      const isEventFromWindow = !target || target === window || target === document || target === document.body;

      if (isEventFromWindow) {
        target = document.activeElement;
      }

      const activeElement = document.activeElement;
      const isTyping =
        isTypingElement(target) || (activeElement && activeElement !== document.body && isTypingElement(activeElement));

      // Ciclo 1: Atalho de pesquisa
      if (key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
        if (!isTyping) {
          const searchButton =
            document.querySelector('button[aria-label="Pesquisar"]') ||
            document.querySelector('button[aria-label="Pesquisar com o Google"]');

          if (searchButton) {
            event.preventDefault();
            searchButton.click();
          }
        }
        return;
      }

      // Ciclo 3: Atalho de ajuda
      if (key === '?' || (key === '/' && event.shiftKey)) {
        if (!isTyping) {
          event.preventDefault();
          setIsHelpOpen(true);
        }
        return;
      }

      // Ciclo 3: Atalho para novo conteúdo
      if (key.toLowerCase() === 'n' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        if (!isTyping) {
          event.preventDefault();
          router.push('/publicar');
        }
        return;
      }

      // Ciclo 2: Navegação entre posts
      if (['j', 'k'].includes(key.toLowerCase()) || key === 'ArrowDown' || key === 'ArrowUp') {
        if (!isTyping) {
          event.preventDefault();
          const direction = key.toLowerCase() === 'j' || key === 'ArrowDown' ? 1 : -1;
          moveFocus(direction);
        }
        return;
      }
    }

    function moveFocus(direction) {
      const focusableLinks = Array.from(document.querySelectorAll('[data-keyboard-nav="content-link"]'));

      if (!focusableLinks.length) return;

      let nextIndex = currentIndexRef.current + direction;

      // Limita aos limites da lista
      if (nextIndex < 0) nextIndex = 0;
      if (nextIndex >= focusableLinks.length) nextIndex = focusableLinks.length - 1;

      currentIndexRef.current = nextIndex;

      const element = focusableLinks[nextIndex];
      if (element) {
        // Garante que o elemento seja focável
        if (element.tabIndex === -1) {
          element.tabIndex = 0;
        }
        element.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  function KeyboardShortcutsOverlay() {
    if (!isHelpOpen) return null;

    return (
      <Box
        role="dialog"
        aria-label="Atalhos de teclado"
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        }}
        onClick={() => setIsHelpOpen(false)}>
        <Box
          sx={{
            backgroundColor: 'canvas.default',
            borderRadius: 2,
            boxShadow: 'shadow.large',
            maxWidth: '400px',
            width: '90%',
            p: 3,
          }}
          onClick={(event) => event.stopPropagation()}>
          <Box as="h2" sx={{ fontSize: 2, fontWeight: 'bold', mb: 2 }}>
            Atalhos de teclado
          </Box>

          <Box as="ul" sx={{ listStyle: 'none', p: 0, m: 0, fontSize: 1 }}>
            <li>
              <strong>/</strong> — Abrir pesquisa
            </li>
            <li>
              <strong>j</strong> / <strong>seta para baixo</strong> — Ir para o próximo conteúdo
            </li>
            <li>
              <strong>k</strong> / <strong>seta para cima</strong> — Ir para o conteúdo anterior
            </li>
            <li>
              <strong>N</strong> — Criar novo conteúdo
            </li>
            <li>
              <strong>?</strong> — Mostrar esta ajuda
            </li>
          </Box>
        </Box>
      </Box>
    );
  }

  return { KeyboardShortcutsOverlay };
}