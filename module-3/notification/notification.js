export default class NotificationMessage {

    element;

    constructor(message, { duration = 1000, type = 'success' }) {
        this.message = message;
        this.duration = duration;
        this.type = type;
        this.render();
    }

    render() {
        const element = document.createElement('div');

        element.innerHTML = `
            <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
                <div class="timer"></div>
                <div class="inner-wrapper">
                    <div class="notification-header">${this.type}</div>
                    <div class="notification-body">
                        ${this.message}
                    </div>
                </div>
            </div>
        `;

        this.element = element.firstElementChild;
    }

    remove() {
        this.element.remove();
    }

    show() {
        const element = document.querySelector('.alert');
        element.append(this.element);
        setTimeout(() => {
            this.remove();
        }, this.duration)
    }
}