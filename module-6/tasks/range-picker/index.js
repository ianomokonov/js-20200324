export default class RangePicker {
  element;
  subElements = {};
  currentMonth;
  selectingFrom = false;
  selected = {
    from: new Date(),
    to: new Date(),
  };
  nextMonthBtn;
  previousMonthBtn;
  months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  constructor({ from = new Date(), to = new Date() } = {}) {
    from = from ? from : new Date();
    this.currentMonth = { month: from.getMonth(), year: from.getFullYear() };
    this.showDateFrom = new Date(from);
    this.selected = { from, to };

    this.render();
  }

  getMonthName(monthNumber) {
    return this.months[monthNumber % 12];
  }

  getMonth(month, delta = 1) {
    const monthDate = new Date(month.year, month.month + delta);
    return { month: monthDate.getMonth(), year: monthDate.getFullYear() };
  }

  getDateClassName(date) {
    if (!date) {
      return '';
    }
    if (this.selected.from && date.getTime() === this.selected.from.getTime()) {
      return 'rangepicker__selected-from';
    }
    if (
      this.selected.from &&
      this.selected.to &&
      date.getTime() > this.selected.from.getTime() &&
      date.getTime() < this.selected.to.getTime()
    ) {
      return 'rangepicker__selected-between';
    }
    if (this.selected.to && date.getTime() === this.selected.to.getTime()) {
      return 'rangepicker__selected-to';
    }
    return '';
  }

  getMonthDateBtns(month) {
    const monthDate = new Date(month.year, month.month);
    const btns = [];
    do {
      btns.push(
        `<button type="button" class="rangepicker__cell ${this.getDateClassName(monthDate)}" data-value=${monthDate.toISOString()} ${
          btns.length === 0 ? `style="--start-from: ${monthDate.getDay()};"` : null
        }>${monthDate.getDate()}</button>`
      );
      monthDate.setDate(monthDate.getDate() + 1);
    } while (monthDate.getMonth() === month.month);

    return btns.join('');
  }

  get selectorTemplate() {
    return `
        <div class="rangepicker__selector-arrow"></div>
        <div class="rangepicker__selector-control-left" data-action="arrow-left"></div>
        <div class="rangepicker__selector-control-right" data-action="arrow-right"></div>
        <div class="rangepicker__calendar">
          <div class="rangepicker__month-indicator">
            <time datetime="${this.getMonthName(this.currentMonth.month)}">${this.getMonthName(this.currentMonth.month)}</time>
          </div>
          <div class="rangepicker__day-of-week">
            <div>Пн</div>
            <div>Вт</div>
            <div>Ср</div>
            <div>Чт</div>
            <div>Пт</div>
            <div>Сб</div>
            <div>Вс</div>
          </div>
          <div class="rangepicker__date-grid">
            ${this.getMonthDateBtns(this.currentMonth)}
          </div>
        </div>
        <div class="rangepicker__calendar">
          <div class="rangepicker__month-indicator">
            <time datetime="${this.getMonthName(this.currentMonth.month + 1)}">${this.getMonthName(this.currentMonth.month + 1)}</time>
          </div>
          <div class="rangepicker__day-of-week">
            <div>Пн</div>
            <div>Вт</div>
            <div>Ср</div>
            <div>Чт</div>
            <div>Пт</div>
            <div>Сб</div>
            <div>Вс</div>
          </div>
          <div class="rangepicker__date-grid">
            ${this.getMonthDateBtns(this.getMonth(this.currentMonth))}
          </div>
        </div>
    `;
  }

  get inputTemplate() {
    return `
        <span data-elem="from">${this.selected.from.toLocaleDateString()}</span> -
        <span data-elem="to">${this.selected.to.toLocaleDateString()}</span>
      `;

    // обработка введения одной даты

    // let result = '';
    // if(this.selected.from){
    //   result += `<span data-elem="from">${this.selected.from.toLocaleDateString()}</span>`;
    // }
    // if(this.selected.to){
    //   result += ` - <span data-elem="to">${this.selected.to.toLocaleDateString()}</span>`;
    // }

    // return result;
  }

  get template() {
    return `
      <div class="rangepicker__input" data-elem="input">
        ${this.inputTemplate}
      </div>
      <div class="rangepicker__selector" data-elem="selector">
        ${this.selectorTemplate}
      </div>
      `;
  }

  render() {
    const elem = document.createElement('div');
    elem.className = 'rangepicker';
    elem.innerHTML = this.template;
    this.element = elem;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
  }

  getSubElements(element) {
    const subElements = {};

    for (const subElement of element.querySelectorAll('[data-elem]')) {
      subElements[subElement.dataset.elem] = subElement;
    }

    return subElements;
  }

  initEventListeners() {
    this.subElements.selector.addEventListener('click', this.handleSelectorClick);
    document.addEventListener('click', this.handleCloseClick, true);
    this.subElements.input.addEventListener('click', this.handleInputClick);
  }

  handleInputClick = () => {
    if (this.selectingFrom) {
      this.element.classList.remove('rangepicker_open');
    } else {
      this.element.classList.add('rangepicker_open');
    }
    this.selectingFrom = !this.selectingFrom;
  };

  handleCloseClick = (event) => {
    if (!event || !event.target.closest('.rangepicker__selector') && !event.target.closest('.rangepicker__input') && this.selectingFrom) {
      this.element.classList.remove('rangepicker_open');
      this.selectingFrom = false;
    }
  };

  handleSelectorClick = (event) => {
    switch (event.target.dataset.action) {
      case 'arrow-left': {
        this.currentMonth = this.getMonth(this.currentMonth, -1);
        this.subElements.input.innerHTML = this.inputTemplate;
        this.subElements.selector.innerHTML = this.selectorTemplate;
        return;
      }
      case 'arrow-right': {
        this.currentMonth = this.getMonth(this.currentMonth);
        this.subElements.input.innerHTML = this.inputTemplate;
        this.subElements.selector.innerHTML = this.selectorTemplate;
        return;
      }
    }

    if (event.target.closest('.rangepicker__cell')) {
      this.setDate(new Date(event.target.dataset.value));
      this.subElements.selector.innerHTML = this.selectorTemplate;
      if (this.selected.from && this.selected.to) {
        this.subElements.input.innerHTML = this.inputTemplate;
        this.handleCloseClick();
      }
    }
  };

  setDate(date) {
    if (!this.selected.from && !this.selected.to) {
      this.selected.from = date;
    } else if (this.selected.from && !this.selected.to && date.getTime() > this.selected.from.getTime()) {
      this.selected.to = date;
    } else {
      this.selected.to = null;
      this.selected.from = date;
    }
  }

  remove() {
    this.element.remove();
    this.subElements.selector.removeEventListener('click', this.handleSelectorClick);
    document.removeEventListener('click', this.handleCloseClick, true);
    this.subElements.input.removeEventListener('click', this.handleInputClick);
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
