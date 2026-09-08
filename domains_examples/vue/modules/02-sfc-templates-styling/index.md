---
id: vue.sfc-templates-styling.index
type: index
title: "Модуль 02 — SFC, шаблоны и стилизация"
tags: [vue, sfc, template, styling]
status: todo
updated: 2026-09-08
---

# Модуль 02 — SFC, шаблоны и стилизация

> Реактивность из модуля 01 нужно где-то поселить. Дом для неё — **Single File
> Component**: один файл `.vue`, в котором логика, разметка и стили лежат рядом. Здесь же
> учимся языку шаблонов: директивам, привязкам, спискам и условиям.

## Цель

После модуля ты:

1. Понимаешь, как приложение попадает на страницу (`index.html` → `main.ts` →
   `createApp().mount()`), как разложен проект `npm create vue@latest` и что такое алиас `@`.
2. Понимаешь устройство `.vue`-файла: блоки `<script setup>`, `<template>`, `<style>`.
3. Свободно владеешь синтаксисом шаблона: интерполяция, `v-bind`/`:`, `v-on`/`@`,
   `v-if`/`v-show`, `v-for` с `:key`, `v-model`.
4. Управляешь классами и инлайн-стилями через `:class` / `:style`.
5. Изолируешь стили компонента через `<style scoped>` и понимаешь, как это работает.
6. Умеешь подключить **Tailwind CSS** к проекту на Vite/Vue и когда он уместен, и держишь
   в голове три базовые привычки доступности.

## Предпосылки

- [`01-reactivity-and-mental-model`](../01-reactivity-and-mental-model/index.md) — `ref`,
  `computed`, ментальная модель «состояние → UI».

## Структура

- [`theory.md`](./theory.md) — анатомия SFC, директивы шаблона, стилизация, Tailwind.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-todo-list-template.md`](./lessons/01-todo-list-template.md) — собираем
  список дел: `v-for`, `v-model`, `v-if`, `:class`, scoped-стили.

## Порядок прохождения

1. `theory.md`.
2. Урок `lessons/01-todo-list-template.md`.
3. `drills.md` + карточки.
