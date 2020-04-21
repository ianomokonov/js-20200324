import escapeHtml from '../../utils/escape-html.js';


export default class ProductFormComponent {
  element;
  subElements = {};
  defaultFormData = {
    title: '',
    description: '',
    subcategory: '',
    price: '',
    discount: '',
    quantity: '',
    status: '',
    images: [],
    categories: [],
  };

  formControls = [];

  onSubmit = (event) => {
    // logic ...
  };

  uploadImage = () => {
    this.element.querySelector('input.fileInput').click();
  };

  constructor(formData = {}) {
    this.formData = { ...this.defaultFormData, ...formData };

    this.render();
    this.patchValue();
  }

  get formValue(){
    const formValue = {};
    this.formControls.forEach(control => {
      formValue[control.name] = control.value;
    })

    return formValue;
  }

  get categoryOptions() {
    return this.formData.categories
      .map(
        (category) => `
          <option value="${category.value}">${category.text}</option>
        `
      )
      .join('');
  }

  getImageItem(image) {
    return `
       <li class="products-edit__imagelist-item sortable-list__item" style="">
         <input type="hidden" name="url" value="${image.url}" />
         <input type="hidden" name="source" value="${image.name}" />
         <span>
           <img src="icon-grab.svg" data-grab-handle="" alt="grab" />
           <img class="sortable-table__cell-img" alt="Image" src="${image.url}" />
           <span>${image.name}</span>
         </span>
         <button type="button" data-delete-handle="">
           <img src="icon-trash.svg" alt="delete" />
         </button>
       </li>
      `
  }

  get imageListTemplate() {
  
    return this.formData.images
    .map(
      (image) => `
       <li class="products-edit__imagelist-item sortable-list__item" style="">
         <input type="hidden" name="url" value="${image.url}" />
         <input type="hidden" name="source" value="${image.name}" />
         <span>
           <img src="icon-grab.svg" data-grab-handle="" alt="grab" />
           <img class="sortable-table__cell-img" alt="Image" src="${image.url}" />
           <span>${image.name}</span>
         </span>
         <button type="button" data-delete-handle="">
           <img src="icon-trash.svg" alt="delete" />
         </button>
       </li>
      `
    )
    .join('');
   }

  get template() {
    return `
      <div class="product-form">
        <form data-elem="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" data-elem="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-elem="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-elem="imageListContainer"><ul class="sortable-list">
              ${this.imageListTemplate}
            </ul></div>
            <input type="file" class="fileInput" style="display: none">
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="category">
              ${this.categoryOptions}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="button" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    this.initEventListeners();
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-elem]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement;

      return accum;
    }, {});
  }

  dispatchEvent = () => {
    this.element.dispatchEvent(new CustomEvent("product-saved", {
      detail: this.formValue
    }));
  }

  onRemoveImgClick = (event) => {
    if(event.target.closest('[data-delete-handle]')){
      const imgLi = event.target.closest('.products-edit__imagelist-item');
      if(imgLi){
        imgLi.remove();
      }
    }
  }

  initEventListeners() {
    this.element.querySelector('button[name="save"]').addEventListener('click', this.dispatchEvent);
    this.subElements['sortable-list-container'].addEventListener('click', this.onRemoveImgClick);
    this.element.querySelector('button[name="uploadImage"]').addEventListener('click', this.uploadImage);
    this.element.querySelector('input.fileInput').addEventListener("change", event => {
      var file = event.target.files[0];
  
      let fileReader = new FileReader;
      fileReader.onload = event => {
        console.log(this.subElements.imageListContainer.children[0])
        let newImageElement = document.createElement("div");
        newImageElement.innerHTML = this.getImageItem({url: event.target.result, name: file.name});
        this.subElements.imageListContainer.children[0].append(newImageElement.firstElementChild);
      };      
      
      fileReader.readAsDataURL(file);
      event.target.files = [];
    });
    
  }

  patchValue() {
    for(let control of this.subElements.productForm.elements){
      if(control.classList.contains('form-control')){
        control.value = this.formData[control.name];
        control.oninput = this.onControlInput;
        this.formControls.push(control);
      }
    }
  }

  onControlInput = (event) => {
    this.formData[event.target.name] = event.target.value;
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    this.element.remove();
  }
}
