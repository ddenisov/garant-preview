/* Поведение и анимации темы «Эвакуатор Гарант». Переносится в тему без изменений. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Шапка получает фон, как только страницу начали прокручивать.
  const header = document.querySelector('.garant-header');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 10);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Кнопка «Позвонить» внизу экрана: показываем, когда телефоны hero ушли за верх экрана.
  const sticky = document.querySelector('.garant-sticky-call');
  const heroPhones = document.querySelector('.garant-hero .garant-phones');
  if (sticky && heroPhones) {
    new IntersectionObserver(([entry]) => {
      sticky.classList.toggle('is-visible', !entry.isIntersecting && entry.boundingClientRect.top < 0);
    }).observe(heroPhones);
  }

  // Появление при прокрутке; внутри .garant-stagger соседи появляются по очереди.
  document.querySelectorAll('.garant-stagger').forEach((group) => {
    group.querySelectorAll(':scope > .reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${i * 100}ms`);
    });
  });
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  if (reduceMotion) return;

  // Заголовок hero проявляется по словам. Вложенные элементы (24/7, «Санкт-Петербурге») — одним словом.
  const title = document.querySelector('.garant-hero__title');
  if (title) {
    let index = 0;
    const makeWord = () => {
      const word = document.createElement('span');
      word.className = 'word';
      word.style.setProperty('--i', index++);
      return word;
    };
    [...title.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            fragment.append(part);
            return;
          }
          const word = makeWord();
          word.textContent = part;
          fragment.append(word);
        });
        node.replaceWith(fragment);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const word = makeWord();
        node.replaceWith(word);
        word.append(node);
      }
    });
  }

  // Цены «докручиваются» от нуля. В конце всегда возвращаем исходный текст как был.
  const groupDigits = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const countUp = (el) => {
    const original = el.textContent;
    const match = original.match(/\d(?:[\s  ]?\d)*/);
    if (!match) return;
    const target = parseInt(match[0].replace(/\D/g, ''), 10);
    const before = original.slice(0, match.index);
    const after = original.slice(match.index + match[0].length);
    const start = performance.now();
    const duration = 1200;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      el.textContent = progress < 1 ? before + groupDigits(Math.round(target * eased)) + after : original;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.garant-price__value').forEach((el) => counterObserver.observe(el));

  // Параллакс фонов-обложек: картинка сдвигается медленнее прокрутки, до ±40px.
  const layers = [...document.querySelectorAll('.garant-parallax .wp-block-cover__image-background')];
  if (layers.length) {
    let queued = false;
    const updateParallax = () => {
      queued = false;
      const viewport = window.innerHeight;
      layers.forEach((img) => {
        const rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewport) return;
        const progress = (rect.top + rect.height / 2 - viewport / 2) / (viewport / 2 + rect.height / 2);
        img.style.transform = `translate3d(0, ${(-progress * 40).toFixed(1)}px, 0)`;
      });
    };
    window.addEventListener('scroll', () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(updateParallax);
      }
    }, { passive: true });
    updateParallax();
  }
})();
