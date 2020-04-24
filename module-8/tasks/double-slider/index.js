export default class DoubleSlider {
  element;
  subElements = {};
  position = {
    shiftX: 0,
    sliderLeft: 0,
    left: true
  };

  constructor ({
     min = 100,
     max = 200,
     formatValue = value => '$' + value,
     selected = {
       from: min,
       to: max
     }
   } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;

    this.render();
  }

  get template () {
    return `
    <div class="range-slider">
      <span data-element="leftLabel">${this.formatValue(this.selected.from)}</span>
      <div data-element="inner" class="range-slider__inner">
        ${this.sliderInnerTemplate}
      </div>
      <span data-element="rightLabel">${this.formatValue(this.selected.to)}</span>
    </div>
    `
  }

  get sliderInnerTemplate() {
    const left = (this.selected.from - this.min) / (this.max - this.min) * 100;
    const right = (this.max - this.selected.to) / (this.max - this.min) * 100;
    return `
      <span class="range-slider__progress" data-element="progress" style="left: ${left}%; right: ${right}%"></span>
      <span class="range-slider__thumb-left" data-element="leftThumb" style="left: ${left}%"></span>
      <span class="range-slider__thumb-right" data-element="rightThumb" style="right: ${right}%"></span>
    `
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
    this.initEventListeners();
  }

  removeListeners () {
    document.removeEventListener('pointerup', this.onMouseUp);
    document.removeEventListener('pointermove', this.onMouseMove);
  }

  initEventListeners () {
    this.subElements.leftThumb.addEventListener('pointerdown', event => {
      event.preventDefault(); // предотвратить запуск выделения (действие браузера)

      this.getInitialPosition();

      document.addEventListener('pointermove', this.onMouseMove);
      document.addEventListener('pointerup', this.onMouseUp);
    });
    this.subElements.rightThumb.addEventListener('pointerdown', event => {
      event.preventDefault(); // предотвратить запуск выделения (действие браузера)

      this.getInitialPosition(false);

      document.addEventListener('pointermove', this.onMouseMove);
      document.addEventListener('pointerup', this.onMouseUp);
    });
  }

  getInitialPosition (left = true) {
    const leftPosition = left ? this.subElements.leftThumb.getBoundingClientRect().left : this.subElements.rightThumb.getBoundingClientRect().left;
    this.position.shiftX = event.clientX - leftPosition;
    this.position.sliderLeft = this.subElements.inner.getBoundingClientRect().left;
    this.position.left = left;
  }

  onMouseMove = event => {
    const { clientX } = event;
    const { shiftX, sliderLeft, left } = this.position;

    let newLeft = clientX - shiftX - sliderLeft;

    // курсор вышел из слайдера => оставить бегунок в его границах.
    let leftEdge = 0;

    if(!left){
      leftEdge = this.subElements.leftThumb.getBoundingClientRect().left - sliderLeft
    }

    if (newLeft < leftEdge) {
      newLeft = leftEdge;
    }

    let rightEdge = this.subElements.inner.offsetWidth - this.subElements.leftThumb.offsetWidth

    if(left) {
      rightEdge = this.subElements.rightThumb.getBoundingClientRect().left - sliderLeft;
    }

    if (newLeft > rightEdge) {
      newLeft = rightEdge;
    }

    if(left){
      this.subElements.leftThumb.style.left = newLeft + 'px';
      this.setProgressPosition({left: newLeft});
      this.setProgressLabels({left: newLeft});
    } else {
      const right = this.subElements.inner.offsetWidth - this.subElements.leftThumb.offsetWidth - newLeft;
      this.subElements.rightThumb.style.right = right + 'px';
      this.setProgressPosition({right: right});
      this.setProgressLabels({right: newLeft});
    }
    
  };

  setProgressPosition(position) {
    if(position.right) {
      this.subElements.progress.style.right = position.right + 'px';
    }
    if(position.left) {
      this.subElements.progress.style.left = position.left + 'px';
    }
  }

  setProgressLabels(position) {
    if(position.right) {
      this.selected.to = this.min + Math.round(position.right / this.subElements.inner.offsetWidth * (this.max - this.min)) + 1;
      this.subElements.rightLabel.innerHTML = this.formatValue(this.selected.to);
    }
    if(position.left) {
      this.selected.from = this.min + Math.round(position.left / this.subElements.inner.offsetWidth * (this.max - this.min));
      this.subElements.leftLabel.innerHTML = this.formatValue(this.selected.from);
    }
  }

  onMouseUp = event => {
    this.element.dispatchEvent(new CustomEvent('position-changed', {
      bubbles: true,
      detail: this.selected
    }));

    this.removeListeners();
  };

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeListeners();
  }
}
