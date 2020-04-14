class Tooltip {
  static instance;

  element;
  pointerOverListener;
  pointerOutListener;
  pointerMoveListener;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initEventListeners() {
    this.pointerOverListener = (event) => {
      if (event.target.dataset.tooltip != undefined) {
        this.render(`<span>${event.target.dataset.tooltip}</span>`);
      }
    };
    this.pointerOutListener = (event) => {
      if (event.target.dataset.tooltip != undefined) {
        this.remove();
      }
    };

    document.addEventListener('pointerover', this.pointerOverListener);
    document.addEventListener('pointerout', this.pointerOutListener);
  }

  initialize() {
    this.initEventListeners();
  }

  render(html) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = html;
    document.body.append(this.element);

    this.pointerMoveListener = (event) => {
      var left = event.clientX + 10;
      var top = event.clientY + 10;
      this.element.style.left = left + 'px';
      this.element.style.top = top + 'px';
    };

    document.addEventListener('pointermove', this.pointerMoveListener);
  }

  remove() {
    document.removeEventListener('pointermove', this.pointerMoveListener);
    this.element.remove();
    this.element = null;
  }

  destroy() {
    document.removeEventListener('pointerover', this.pointerOverListener);
    document.removeEventListener('pointerout', this.pointerOutListener);
    this.remove();
  }
}

const tooltip = new Tooltip();

export default tooltip;
