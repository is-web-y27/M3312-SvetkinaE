export function initChat() {
    const widget = document.querySelector('.chat-widget');
    if (!widget) return;

    const toggle = widget.querySelector('.chat-toggle');
    const closeBtn = widget.querySelector('.chat-close');
    const win = widget.querySelector('.chat-window');

    toggle.addEventListener('click', () => {
        win.classList.toggle('open');
    });

    closeBtn.addEventListener('click', () => {
        win.classList.remove('open');
    });
}
