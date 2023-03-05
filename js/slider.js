  var swiper = new Swiper('.swiper-container', {
    direction: 'horizontal',
    loop: false,
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    spaceBetween: 10,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });