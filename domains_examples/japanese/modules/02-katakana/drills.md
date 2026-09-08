---
id: japanese.katakana.drills
type: drills
title: "Катакана — упражнения"
tags: [japanese, katakana, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

Узнавание знаков, похожие пары, чтение заимствований. Ответы в ромадзи как способ
записи произношения.

## Блок 1. Базовые знаки

```drill
type: translate
prompt: "Прочитай: カ"
answer: ka
check: exact
```

```drill
type: multiple-choice
prompt: "Какой знак читается «ko»?"
options: [カ, ク, コ, ケ]
answer: コ
check: exact
```

```drill
type: translate
prompt: "Прочитай: ア"
answer: a
check: exact
```

## Блок 2. Похожие пары (главное)

```drill
type: multiple-choice
prompt: "Где знак «shi» (а не «tsu»)?"
options: [ツ, シ, ソ, ン]
answer: シ
check: exact
hint: シ — штрихи «снизу вверх», родня し
```

```drill
type: multiple-choice
prompt: "Где знак «n» (а не «so»)?"
options: [ソ, ン, シ, ツ]
answer: ン
check: exact
```

```drill
type: free-form
prompt: "Объясни, как отличить シ (shi) от ツ (tsu)."
answer: シ — штрихи почти горизонтальные, идут снизу вверх (как в хирагане し); ツ — штрихи вертикальнее, сверху вниз.
check: manual
```

## Блок 3. Долгота и удвоение

```drill
type: multiple-choice
prompt: "Что делает знак ー в コーヒー?"
options: [читается «ru», удлиняет гласный, удваивает согласный, ничего]
answer: удлиняет гласный
check: exact
```

```drill
type: translate
prompt: "Прочитай: ビール"
answer: biru | bīru
check: fuzzy
hint: пиво
```

## Блок 4. Чтение заимствований

```drill
type: translate
prompt: "Прочитай и узнай слово: コーヒー"
answer: kōhī — кофе
check: fuzzy
```

```drill
type: translate
prompt: "Прочитай и узнай: テレビ"
answer: terebi — телевизор
check: fuzzy
```

```drill
type: multiple-choice
prompt: "Какое слово означает «Россия»?"
options: [アメリカ, ロシア, タクシー, パソコン]
answer: ロシア
check: exact
```

```drill
type: translate
prompt: "Прочитай: タクシー"
answer: takushī — такси
check: fuzzy
```

```drill
type: free-form
prompt: "Прочитай и угадай исходное слово: マクドナルド"
answer: makudonarudo — McDonald's (японская фонетика вставляет гласные между согласными)
check: manual
```

## Блок 5. Расширенная катакана

```drill
type: multiple-choice
prompt: "Как читается ファ?"
options: [fu-a (два слога), fa (один слог), ha, pa]
answer: fa (один слог)
check: exact
hint: маленькая ァ перебивает гласную у フ
```

```drill
type: translate
prompt: "Прочитай и узнай: ファイル"
answer: fairu — файл
check: fuzzy
```

```drill
type: translate
prompt: "Прочитай и узнай: パーティー"
answer: pātī — вечеринка (party)
check: fuzzy
hint: ティ = ti, два знака долготы
```

```drill
type: multiple-choice
prompt: "チェック — это:"
options: [чек/проверка, стул, щека, чашка]
answer: чек/проверка
check: exact
```

```drill
type: multiple-choice
prompt: "Что делает точка ・ в アンナ・カレーニナ?"
options: [означает паузу в речи, разделяет части иностранного имени, удлиняет гласный, это опечатка]
answer: разделяет части иностранного имени
check: exact
```

## Блок 6. Чтение вывесок и меню

```drill
type: translate
prompt: "Прочитай и узнай: レストラン"
answer: resutoran — ресторан
check: fuzzy
```

```drill
type: translate
prompt: "Прочитай и узнай: メニュー"
answer: menyū — меню
check: fuzzy
```

```drill
type: translate
prompt: "Прочитай и узнай: トイレ"
answer: toire — туалет (toilet)
check: fuzzy
```

```drill
type: multiple-choice
prompt: "アルバイト пришло из какого языка?"
options: [английского, немецкого (Arbeit), португальского, французского]
answer: немецкого (Arbeit)
check: exact
hint: катакана — не всегда английское слово
```

```drill
type: free-form
prompt: "Прочитай по слогам и угадай: サンドイッチ (подсказка: тут есть ッ)"
answer: sandoitchi — сэндвич. Маленькая ッ даёт удвоение перед チ.
check: manual
```

```drill
type: free-form
prompt: "Прочитай вывеску и скажи, что это за место: カフェ・スタート"
answer: kafe sutāto — «Кафе Старт». フェ = fe (расширенная катакана), ・ разделяет части названия.
check: manual
```
