export default class Slider {
  element; // HTMLElement;
  thumb; // HTMLElement;
  thumbRight; // HTMLElement;
  position = {
    shiftX: 0,
    sliderLeft: 0,
    left: true
  };

  onMouseMove = event => {
    const { clientX } = event;
    const { shiftX, sliderLeft, left } = this.position;

    let newLeft = clientX - shiftX - sliderLeft;

    // курсор вышел из слайдера => оставить бегунок в его границах.
    let leftEdge = 0;

    if(!left){
      leftEdge = this.thumb.getBoundingClientRect().left - sliderLeft + this.thumb.offsetWidth
    }

    if (newLeft < leftEdge) {
      newLeft = leftEdge;
    }

    let rightEdge = this.element.offsetWidth - this.thumb.offsetWidth

    if(left) {
      rightEdge = this.thumbRight.getBoundingClientRect().left - sliderLeft - this.thumb.offsetWidth;
    }

    if (newLeft > rightEdge) {
      newLeft = rightEdge;
    }

    if(left){
      this.thumb.style.left = newLeft + 'px';
    } else {
      this.thumbRight.style.left = newLeft + 'px';
    }
    
  };

  onMouseUp = event => {
    console.error('event', event);

    this.element.dispatchEvent(new CustomEvent('position-changed', {
      bubbles: true,
      detail: event
    }));

    this.removeListeners();
  };

  constructor() {
    this.render();
    this.initEventListeners();
  }

  initEventListeners() {

    this.thumb.addEventListener('pointerdown', event => {
      event.preventDefault(); // предотвратить запуск выделения (действие браузера)

      this.getInitialPosition(event);

      document.addEventListener('pointermove', this.onMouseMove);
      document.addEventListener('pointerup', this.onMouseUp);
    });
    this.thumbRight.addEventListener('pointerdown', event => {
      event.preventDefault(); // предотвратить запуск выделения (действие браузера)

      this.getInitialPosition(event, false);

      document.addEventListener('pointermove', this.onMouseMove);
      document.addEventListener('pointerup', this.onMouseUp);
    });
  }

  getInitialPosition (event, left = true) {
    const leftPosition = left ? this.thumb.getBoundingClientRect().left : this.thumbRight.getBoundingClientRect().left;
    this.position.shiftX = event.clientX - leftPosition;
    this.position.sliderLeft = this.element.getBoundingClientRect().left;
    this.position.left = left;
  }

  render () {
    const element = document.createElement('div');

    element.innerHTML = `
      <div id="slider" class="slider">
        <div class="thumb"></div>
        <div class="thumb"></div>
      </div>
    `;

    this.element = element.firstElementChild;
    this.thumb = this.element.querySelector('.thumb');
    this.thumbRight = this.element.querySelectorAll('.thumb')[1];
    this.thumbRight.style.left = '30px';
  }

  remove () {
    this.element.remove();
  }

  removeListeners () {
    document.removeEventListener('pointerup', this.onMouseUp);
    document.removeEventListener('pointermove', this.onMouseMove);
  }

  destroy() {
    this.remove();
    this.removeListeners();
  }
}
