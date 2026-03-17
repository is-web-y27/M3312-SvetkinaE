const loadBtn = document.getElementById("loadBtn");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");
const commentsList = document.getElementById("commentsList");

let currentPost = 1;

async function loadComments() {
    errorBox.classList.add("hidden");
    loader.classList.remove("hidden");
    commentsList.innerHTML = "";

    try {
        const resp = await fetch(
            `https://jsonplaceholder.typicode.com/comments?postId=${currentPost}`
        );

        if (!resp.ok) throw new Error("Ошибка ответа сервера");

        const data = await resp.json();
        renderComments(data);

    } catch (err) {
        showError(err.message);
    } finally {
        loader.classList.add("hidden");
    }
}

function renderComments(data) {
    data.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("comment-card");

        card.innerHTML = `
            <h3>${item.name}</h3>
            <p><b>Email:</b> ${item.email}</p>
            <p>${item.body}</p>
        `;

        commentsList.appendChild(card);
    });
}

function showError(text) {
    errorBox.textContent = text;
    errorBox.classList.remove("hidden");
}

loadBtn.addEventListener("click", () => {
    currentPost = (currentPost % 10) + 1;
    loadComments();
});

window.addEventListener("DOMContentLoaded", loadComments);
