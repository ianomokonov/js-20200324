import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loadedSize = 0;
  pageSize = 30;
  isLoading = false;
  isLoaded = false;

  onSortClick = (event) => {
    const column = event.target.closest('[data-sortable="true"]');
    const toggleOrder = (order) => {
      const orders = {
        asc: 'desc',
        desc: 'asc',
      };

      return orders[order];
    };
    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortLocally(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }
  };

  constructor(
    headersConfig = [],
    {
      url = '',
      sorted = {
        id: headersConfig.find((item) => item.sortable).id,
        order: 'asc',
      },
      isSortLocally = true,
    } = {}
  ) {
    this.windowHeight = window.innerHeight;
    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);

    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();
  }

  async render() {
    const { id, order } = this.sorted;
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = await this.loadData(id, order);

    this.renderRows(data);
    this.initEventListeners();
  }

  async loadData(id, order) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', this.loadedSize);
    this.url.searchParams.set('_end', this.loadedSize + this.pageSize);
    this.isLoading = true;
    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');
    this.isLoading = false;
    if (data.length < this.pageSize) {
      this.isLoaded = true;
    }
    
    this.loadedSize += this.pageSize;

    return data;
  }

  addRows(data) {
    this.data.push(...data);
    this.subElements.body.innerHTML = this.getTableRows(this.data);
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headersConfig.map((item) => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow({ id, title, sortable }) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }

  getTableRows(data) {
    return data
      .map(
        (item) => `
      <div class="sortable-table__row">
        ${this.getTableRow(item, data)}
      </div>`
      )
      .join('');
  }

  getTableRow(item) {
    const cells = this.headersConfig.map(({ id, template }) => {
      return {
        id,
        template,
      };
    });

    return cells
      .map(({ id, template }) => {
        return template ? template(item[id]) : `<div class="sortable-table__cell">${item[id]}</div>`;
      })
      .join('');
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(this.data)}

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          No products
        </div>
      </div>`;
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    document.addEventListener('scroll', this.onBodyScroll);
  }

  onBodyScroll = async () => {
    if (!this.isLoaded && !this.isLoading && document.documentElement.getBoundingClientRect().bottom < this.windowHeight + 100) {
      const data = await this.loadData(this.sorted.id, this.sorted.order);

      this.renderRows(data);
    }
  };

  sortLocally(id, order) {
    const sortedData = this.sortData(id, order);

    this.subElements.body.innerHTML = this.getTableBody(sortedData);
  }

  async sortOnServer(id, order) {
    this.loadedSize = 0;
    this.isLoaded = false;
    this.data = [];
    console.log(1111)
    const data = await this.loadData(id, order);
    this.renderRows(data);
  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.addRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find((item) => item.id === id);
    const { sortType, customSorting } = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[id] - b[id]);
        case 'string':
          return direction * a[id].localeCompare(b[id], 'ru');
        case 'custom':
          return direction * customSorting(a, b);
        default:
          return direction * (a[id] - b[id]);
      }
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    document.removeEventListener('scroll', this.onBodyScroll);
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
