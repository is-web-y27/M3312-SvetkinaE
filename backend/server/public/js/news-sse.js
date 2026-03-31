const eventsContainer = document.getElementById('news-events');

if (eventsContainer) {
  const eventSource = new EventSource('/news/stream');
  eventSource.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    const item = document.createElement('p');
    item.textContent = payload.message;
    eventsContainer.prepend(item);
  };
}
