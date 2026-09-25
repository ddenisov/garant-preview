/* Галерея «Фото»: просмотр фото по клику, листание стрелками, свайпом и с клавиатуры.
   PhotoSwipe 5 (MIT) лежит в assets/vendor/photoswipe; основной модуль грузится только при первом открытии. */
import PhotoSwipeLightbox from '../vendor/photoswipe/photoswipe-lightbox.esm.min.js';

const lightbox = new PhotoSwipeLightbox({
  gallery: '.garant-gallery .wp-block-gallery',
  children: 'a',
  pswpModule: () => import('../vendor/photoswipe/photoswipe.esm.min.js'),
  bgOpacity: 1,
  showHideAnimationType: 'zoom',
  closeTitle: 'Закрыть',
  zoomTitle: 'Увеличить',
  arrowPrevTitle: 'Предыдущее фото',
  arrowNextTitle: 'Следующее фото',
  errorMsg: 'Не удалось загрузить фото',
  indexIndicatorSep: ' / ',
});

// В WordPress блок «Галерея» не выводит data-pswp-width/height: берём пропорции превью.
lightbox.addFilter('itemData', (itemData) => {
  const img = itemData.element?.querySelector('img');
  if (img && !itemData.width) {
    itemData.width = img.naturalWidth * 2;
    itemData.height = img.naturalHeight * 2;
  }
  return itemData;
});

lightbox.init();
