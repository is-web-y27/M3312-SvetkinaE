# Лабораторная работа 2

## Доменная область

Проект описывает виртуальный музей технологий будущего.
Сайт содержит разделы экспонатов, новостей, галереи и обратной связи.
Модель данных отражает работу посетителей и контента музея.

## Сущности домена

- Visitor
- Category
- Exhibit
- News
- Review
- Feedback
- GalleryItem

## Связи между сущностями

- Category 1:N Exhibit
- Exhibit 1:N News
- Exhibit 1:N Review
- Exhibit 1:N GalleryItem
- Visitor 1:N Review
- Visitor 1:N Feedback
