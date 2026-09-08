---
id: japanese.reading-simple.drills
type: drills
title: "Чтение простых текстов — упражнения"
tags: [japanese, reading, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

Читай вывески, фразы и текст — лови смысл, не переводи каждое слово. Опирайся на кандзи,
частицы и сказуемое в конце.

## Блок 1. Вывески

```drill
type: multiple-choice
prompt: "На двери: 入口. Что это?"
options: [выход, вход, закрыто, туалет]
answer: вход
check: exact
```

```drill
type: translate
prompt: "Прочитай вывеску: 駅"
answer: eki — станция
check: fuzzy
```

```drill
type: multiple-choice
prompt: "На ценнике: 五百円. Сколько это?"
options: [50 иен, 500 иен, 5000 иен, 15 иен]
answer: 500 иен
check: exact
```

```drill
type: multiple-choice
prompt: "Знак トイレ означает:"
options: [станция, выход, туалет, вход]
answer: туалет
check: exact
hint: катакана от toilet
```

## Блок 2. Приветствия и фразы

```drill
type: translate
prompt: "Что значит おはようございます?"
answer: доброе утро
check: fuzzy
```

```drill
type: multiple-choice
prompt: "いくらですか。 — о чём спрашивают?"
options: [как тебя зовут, сколько стоит, который час, где это]
answer: сколько стоит
check: exact
```

```drill
type: translate
prompt: "Что значит これは なんですか。?"
answer: что это?
check: fuzzy
```

```drill
type: multiple-choice
prompt: "Что делает か в конце «これはペンですか»?"
options: [отрицание, превращает в вопрос, прошлое, вежливость]
answer: превращает в вопрос
check: exact
```

## Блок 3. Сегментация и структура

```drill
type: free-form
prompt: "Раздели на «слово+роль» по частицам: 私は水を飲みます。 (飲みます nomimasu — пить)"
answer: "私+は (тема: я) / 水+を (объект: вода) / 飲みます (сказуемое в конце: пить). Смысл: «Я пью воду»."
check: manual
```

```drill
type: multiple-choice
prompt: "В предложении 学校に行きません куда смотреть, чтобы понять «иду или НЕ иду»?"
options: [на первое слово, на частицу に, на конец (行きません), всё равно]
answer: на конец (行きません)
check: exact
hint: полярность — в сказуемом, в конце
```

## Блок 4. Связный текст

```drill
type: free-form
prompt: "Прочитай и переведи: 私は日本人です。東京の大学の学生です。 (東京 Tōkyō — Токио)"
answer: «Я японец. (Я) студент токийского университета.» (второе предложение опускает подлежащее — оно понятно)
check: manual
```

```drill
type: free-form
prompt: "Прочитай: 土曜日に友だちとカフェでコーヒーを飲みます。 (友だち tomodachi — друг, と — с)"
answer: doyōbi-ni tomodachi-to kafe-de kōhī-o nomimasu — «В субботу с другом в кафе пью кофе». (土曜日 суббота, カフェ катакана = cafe, で место действия)
check: manual
```

```drill
type: free-form
prompt: "Применил ли ты стратегии? Назови, какие подсказки помогли прочитать текст про кафе."
answer: Кандзи-островки (土曜日, 友, 飲) дали смысл; частицы (に, と, で, を) — роли; катакана カフェ = заимствование (cafe); сказуемое 飲みます в конце.
check: manual
```

## Блок 5. Узнавание простой формы

```drill
type: multiple-choice
prompt: "В тексте написано «コーヒーを のんだ». Что это значит?"
options: [пью кофе, выпил кофе, не пью кофе, буду пить кофе]
answer: выпил кофе
check: exact
hint: хвост 〜だ/〜た = прошедшее время
```

```drill
type: multiple-choice
prompt: "«わからない» — это то же, что:"
options: [わかります, わかりません, わかりました, わかりましょう]
answer: わかりません
check: exact
hint: 〜ない = отрицание
```

```drill
type: multiple-choice
prompt: "«たべている» — что происходит?"
options: [поел, ест прямо сейчас, будет есть, не ест]
answer: ест прямо сейчас
check: exact
```

```drill
type: free-form
prompt: "Переведи в вежливую форму и переведи на русский: 学校に 行かない。"
answer: 学校に 行きません。 — «(Я) не иду в школу». Хвост 〜ない = отрицание.
check: manual
```

## Блок 6. Вывески и объявления

```drill
type: multiple-choice
prompt: "На двери кафе висит 準備中. Можно зайти?"
options: [да, открыто, нет — «готовимся», ещё закрыто, только по записи, это туалет]
answer: нет — «готовимся», ещё закрыто
check: exact
```

```drill
type: multiple-choice
prompt: "Табличка 非常口 — что это?"
options: [вход, запасный выход, запрещено, бесплатно]
answer: запасный выход
check: exact
```

```drill
type: multiple-choice
prompt: "На объявлении написано 無料. О чём речь?"
options: [дорого, бесплатно, запрещено, внимание]
answer: бесплатно
check: exact
```

```drill
type: translate
prompt: "Прочитай вывеску магазина: 営業中 9:00〜18:00"
answer: eigyōchū — «открыто/работаем», с 9:00 до 18:00
check: fuzzy
```

## Блок 7. Связный текст

```drill
type: free-form
prompt: "Прочитай и перескажи по-русски: 私は まいにち 七時に おきます。学校まで バスで 行きます。今日は 天気が いいです。ともだちと こうえんに 行きました。"
answer: «Я каждый день встаю в 7 часов. До школы езжу на автобусе. Сегодня хорошая погода. Ходил(а) с друзьями в парк». (天気 — погода, こうえん — парк; заметь 〜ました в конце последней фразы — прошедшее)
check: manual
```

```drill
type: free-form
prompt: "Из того же текста: по каким признакам ты понял, что последняя фраза — про прошлое?"
answer: "По сказуемому в конце: 行きました — вежливое прошедшее (〜ました). Смотреть надо в конец предложения, там и время, и отрицание."
check: manual
```
