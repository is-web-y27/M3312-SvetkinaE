export function initFeedback() {
    const form = document.getElementById("feedbackForm");
    const list = document.getElementById("feedbackList");
    const template = document.querySelector("#template .feedback-item");

    const saved = JSON.parse(localStorage.getItem("feedbackList")) || [];
    saved.forEach(item => renderFeedback(item));

    function renderFeedback(data) {
        const node = template.cloneNode(true);

        node.querySelector(".item-name").textContent = data.name;
        node.querySelector(".item-email").textContent = data.email;
        node.querySelector(".item-message").textContent = data.message;

        node.querySelector(".edit-btn").addEventListener("click", () => {
            const newMessage = prompt("Введите новый текст:", data.message);
            if (newMessage && newMessage.length >= 5) {
                data.message = newMessage;
                node.querySelector(".item-message").textContent = newMessage;
                save();
            } else {
                alert("Сообщение слишком короткое.");
            }
        });

        list.appendChild(node);
    }

    function save() {
        localStorage.setItem("feedbackList", JSON.stringify(saved));
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        if (name.length < 2) {
            alert("Имя слишком короткое.");
            return;
        }
        if (!email.includes("@")) {
            alert("Неверный email.");
            return;
        }
        if (message.length < 5) {
            alert("Сообщение слишком короткое.");
            return;
        }

        const data = { name, email, message };

        saved.push(data);
        save();
        renderFeedback(data);

        form.reset();
    });
}
