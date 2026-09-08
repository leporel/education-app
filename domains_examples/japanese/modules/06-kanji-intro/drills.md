---
id: japanese.kanji-intro.drills
type: drills
title: "Введение в кандзи — упражнения"
tags: [japanese, kanji, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

Понятие кандзи, чтение чисел, смешанный текст.

## Блок 1. Понятия

```drill
type: multiple-choice
prompt: "Что несёт кандзи (в отличие от каны)?"
options: [только звук, смысл/значение, только грамматику, ничего]
answer: смысл/значение
check: exact
```

```drill
type: free-form
prompt: "Объясни своими словами, зачем нужны кандзи, если есть кана."
answer: Кандзи режут текст на слова (пробелов нет), различают омофоны (はし — мост/палочки/край) и сжимают смысл (один знак = корень слова). Без них реальный текст почти нечитаем.
check: manual
```

```drill
type: multiple-choice
prompt: "В слове 食べる что такое べる?"
options: [онъёми, окуригана (кана-хвост), радикал, частица]
answer: окуригана (кана-хвост)
check: exact
```

## Блок 2. Числа 一〜十

```drill
type: translate
prompt: "Прочитай число: 三"
answer: san | 3
check: fuzzy
```

```drill
type: translate
prompt: "Прочитай число: 七"
answer: nana | shichi | 7
check: fuzzy
```

```drill
type: multiple-choice
prompt: "Какой кандзи означает 5?"
options: [四, 五, 六, 九]
answer: 五
check: exact
```

```drill
type: fill-in
prompt: "Запиши число 10 кандзи:"
answer: 十
check: exact
```

## Блок 3. Составные числа

```drill
type: translate
prompt: "Прочитай: 十二"
answer: jū-ni | 12
check: fuzzy
```

```drill
type: translate
prompt: "Прочитай: 二十一"
answer: ni-jū-ichi | 21
check: fuzzy
```

```drill
type: multiple-choice
prompt: "Как записать 30 кандзи?"
options: [十三, 三十, 三百, 三千]
answer: 三十
check: exact
```

```drill
type: translate
prompt: "Прочитай год: 二千二十六"
answer: ni-sen ni-jū-roku | 2026
check: fuzzy
```

## Блок 4. Смешанный текст

```drill
type: free-form
prompt: "Прочитай и переведи: 私は山に行きます。 (私 watashi — я, 山 yama — гора, 行きます ikimasu — идти)"
answer: "watashi-wa yama-ni ikimasu — «Я иду в горы». Заметь: кандзи = корни (私, 山, 行), кана = грамматика (は, に, きます)."
check: manual
```

```drill
type: free-form
prompt: "Почему 私は山に行きます читать легче, чем わたしはやまにいきます?"
answer: Кандзи (私, 山, 行) визуально выделяют смысловые корни и режут текст на слова — пробелов в японском нет, и иероглифы выполняют их роль.
check: manual
```

## Блок 5. Ноль, чтения и счётные суффиксы

```drill
type: multiple-choice
prompt: "Как чаще всего говорят «ноль» в быту?"
options: [零, ゼロ, なし, 〇と]
answer: ゼロ
check: exact
```

```drill
type: fill-in
prompt: "Запиши каной чтение 七, которое предпочитают в быту:"
answer: なな
check: fuzzy
hint: не しち
```

```drill
type: multiple-choice
prompt: "三百円 — что это?"
options: [3 часа, 300 иен, 3 человека, 300 минут]
answer: 300 иен
check: exact
```

```drill
type: multiple-choice
prompt: "Как сказать «два человека»?"
options: [二人 (futari), 二人 (nininn), 二つ, 二時]
answer: 二人 (futari)
check: exact
hint: "1 и 2 человека читаются особо: hitori, futari"
```

```drill
type: free-form
prompt: "Объясни своими словами, зачем японскому нужны счётные суффиксы, и приведи два примера."
answer: "Суффикс сообщает, что именно считают, — просто «три» сказать нельзя. Примеры: 三百円 (300 иен), 七時 (7 часов), 三つ (три штуки). В русском похожее есть в «три головы скота», «пять штук»."
check: manual
```

## Блок 6. Поиск и чтения

```drill
type: multiple-choice
prompt: "Ты встретил незнакомый кандзи в бумажной книге. Что сработает?"
options: [вставить текст в jisho.org, нарисовать знак рукописным вводом в словаре, спросить у кого-нибудь, ничего]
answer: нарисовать знак рукописным вводом в словаре
check: exact
hint: текст бумажный — скопировать нечего
```

```drill
type: multiple-choice
prompt: "В 大学 кандзи читаются по-он или по-кун?"
options: [по-кун (это одиночные слова), по-он (это составное слово), смешанно, зависит от контекста]
answer: по-он (это составное слово)
check: exact
```

```drill
type: free-form
prompt: "Что такое фуригана и почему ею не стыдно пользоваться?"
answer: Мелкая кана над кандзи с подсказкой чтения. Она специально ставится в учебных и детских текстах; на этом уровне она ускоряет чтение и помогает запоминать связку «знак — чтение».
check: manual
```
