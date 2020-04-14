export default class SortableTable {
  element;
  subElements = {};
  headersConfig = [];
  data = [];

  constructor(headersConfig, { data = [], sorting = {} } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;

    this.render();
    if (sorting.field) {
      this.sort(sorting.field, sorting.order);
    }
    this.initEventListeners();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTable(this.data);
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  initEventListeners() {
    this.subElements.header.addEventListener('click', event => {
      const closest = event.target.closest("div.sortable-table__cell");
      if(!closest){
        return;
      }
      const dataset = closest.dataset;
      if(dataset.sortable === "true"){
        this.sort(dataset.name, dataset.order === 'asc' ? 'desc' : 'asc');
      }
    })
  }

  getTable() {
    return `
      <div class="sortable-table">    
        ${this.getTableHeader()}
        <div data-elem="body" class="sortable-table__body">
          ${this.getTableBody()}
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
    this.remove();
    this.subElements = {};
  }

  sort(field, order) {
    let sortData = this.sortData(field, order);
    this.subElements.header.innerHTML = this.getTableHeaderRows(field, order);
    this.subElements.body.innerHTML = this.getTableBody(sortData);
  }

  sortData(field, order) {
    const { sortType } = this.headersConfig.find((item) => item.id === field);
    let direction = order === 'asc' ? 1 : -1;

    return this.data.sort(function (a, b) {
      switch (sortType) {
        case 'number':
          return direction * (a[field] - b[field]);
        case 'string':
          return direction * a[field].localeCompare(b[field], 'default', { caseFirst: 'upper' });
        default:
          return direction * a[field].localeCompare(b[field], 'default', { caseFirst: 'upper' });
      }
    });
  }
}
