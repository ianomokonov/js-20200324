import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  pageSize = 0;

  constructor(
    headersConfig = [],
    {
      url = '',
      sorted = {
        id: headersConfig.find((item) => item.sortable).id,
        order: 'asc',
      },
      isSortLocally = false,
    } = {}
  ) {
    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();
  }

  async render() {
    const { id, order } = this.sorted;
    const element = document.createElement('div');
    element.innerHTML = this.getTable(this.data);
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.sort(id, order);
    this.initEventListeners();
  }

  async loadData(id, order) {
    const params = {
      _embed: 'subcategory.category',
      _sort: id,
      _order: order,
      _start: 0,
      _end: this.pageSize,
    };
    Object.entries(params).forEach(([key, value]) => {
      this.url.searchParams.set(key, value);
    });
    const data = fetchJson(this.url);

    return data;
  }

  initEventListeners() {
    this.sortEventListener = (event) => {
      const closest = event.target.closest('div.sortable-table__cell');
      if (!closest) {
        return;
      }
      const dataset = closest.dataset;
      if (dataset.sortable === 'true') {
        this.sort(dataset.name, dataset.order === 'asc' ? 'desc' : 'asc');
      }
    };
    this.subElements.header.addEventListener('click', this.sortEventListener);
    this.subElements.emptyPlaceholder.querySelector('button').addEventListener('click', this.resetFilters);
  }

  resetFilters = () => {
    this.sorted = {
      id: this.headersConfig.find((item) => item.sortable).id,
      order: 'asc',
    }
    this.pageSize = 30;
    this.sort(this.sorted.id, this.sorted.order);
  }

  getTable() {
    return `
      <div class="sortable-table">    
        ${this.getTableHeader()}
        <div data-elem="body" class="sortable-table__body">
          ${this.getTableBody()}
        </div>  
        <div data-elem="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-elem="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>             
      </div>`;
  }

  getTableHeader(field, order) {
    return `
      <div data-elem="header" class="sortable-table__header sortable-table__row">
        ${this.getTableHeaderRows(field, order)}        
      </div>
    `;
  }

  getTableHeaderRows(field, order) {
    return this.headersConfig
      .map((item) => {
        return `
        <div class="sortable-table__cell" data-name="${item.id}" data-sortable="${item.sortable}" data-order="${
          field == item.id ? order : ''
        }">
          <span>${item.title}</span>
          ${field == item.id ? '<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>' : ''}
        </div>
      `;
      })
      .join('');
  }

  getSubElements(parentElement) {
    const elems = parentElement.querySelectorAll('[data-elem]');
    const result = {};
    for (let elem of elems) {
      result[elem.dataset.elem] = elem;
    }
    return result;
  }

  getTableBody(data = this.data) {
    return data.map((item) => this.getTableRow(item)).join('');
  }

  getTableRow(dataItem) {
    let dataItemHTML = this.headersConfig
      .map(function (item) {
        return item.template ? item.template(dataItem[item.id]) : `<div class="sortable-table__cell">${dataItem[item.id]}</div>`;
      })
      .join('');

    return `<a href="/products/${dataItem.id}" class="sortable-table__row">${dataItemHTML}</a>`;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.subElements.header.removeEventListener('click', this.sortEventListener);
    this.remove();
    this.subElements = {};
  }

  async sort(field, order) {
    this.subElements.loading.style.display = "block";
    this.subElements.emptyPlaceholder.style.display = "none";
    this.subElements.body.innerHTML = '';
    this.data = await this.loadData(field, order);
    this.subElements.loading.style.display = "none";
    if(!this.data?.length){
      this.subElements.emptyPlaceholder.style.display = "block";
    }
    this.subElements.header.innerHTML = this.getTableHeaderRows(field, order);
    this.subElements.body.innerHTML = this.getTableBody(this.data);
  }
}
