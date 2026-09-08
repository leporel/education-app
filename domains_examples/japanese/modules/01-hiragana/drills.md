---
id: japanese.hiragana.drills
type: drills
title: "Хирагана — упражнения"
tags: [japanese, hiragana, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

Узнавание знаков и чтение слов. Ответы в ромадзи (как способ записать произношение),
но цель — **узнать кану**, а не вспомнить латиницу. Проверка `exact` для отдельных
знаков, `fuzzy` для слов.

## Блок 1. Гласные (ряд あ)

```drill
type: translate
prompt: "Прочитай: お"
answer: o
check: exact
```

```drill
type: multiple-choice
prompt: "Какой знак читается «u»?"
options: [あ, う, え, お]
answer: う
check: exact
```

```drill
type: translate
prompt: "Прочитай слово: あい"
answer: ai
check: exact
hint: любовь
```

```drill
type: translate
prompt: "Прочитай слово: いえ"
answer: ie
check: exact
hint: дом
```

## Блок 2. Ряды か и さ

```drill
type: translate
prompt: "Прочитай: き"
answer: ki
check: exact
```

```drill
type: translate
prompt: "Прочитай знак: し"
answer: shi
check: fuzzy
hint: не «si»
```

```drill
type: translate
prompt: "Прочитай слово: かお"
answer: kao
check: fuzzy
hint: лицо
```

```drill
type: translate
prompt: "Прочитай слово: すし"
answer: sushi
check: fuzzy
```

```drill
type: multiple-choice
prompt: "Какое слово означает «кошка»?"
options: [いぬ, ねこ, さかな, あお]
answer: ねこ
check: exact
```

## Блок 3. Похожие пары (ловушки)

```drill
type: multiple-choice
prompt: "Где знак « chi»?"
options: [さ, ち, き, ら]
answer: ち
check: exact
hint: さ и ち — зеркальная пара
```

```drill
type: multiple-choice
prompt: "Где знак «ri»?"
options: [い, り, し, け]
answer: り
check: exact
```

```drill
type: multiple-choice
prompt: "Какой из знаков — «ne»?"
options: [わ, れ, ね, の]
answer: ね
check: exact
hint: ね/れ/わ различаются хвостом
```

```drill
type: free-form
prompt: "Объясни своими словами, как отличить あ от お."
answer: У お есть дополнительный крючок/петля справа сверху, у あ его нет.
check: manual
```

## Блок 4. Дакутэн и хандакутэн

```drill
type: fill-in
prompt: "か + дакутэн (゛) читается как ___"
answer: ga
check: exact
```

```drill
type: translate
prompt: "Прочитай: じ"
answer: ji
check: fuzzy
hint: し + дакутэн
```

```drill
type: multiple-choice
prompt: "Какой знак получает хандакутэн (゜) и звук «pa»?"
options: [か, さ, は, た]
answer: は
check: exact
hint: хандакутэн только у ряда は
```

## Блок 5. Ёон и чтение слов

```drill
type: multiple-choice
prompt: "Как читается きゃ (с маленькой ゃ)?"
options: [ki-ya (два слога), kya (один слог), ka-ya, kiya]
answer: kya (один слог)
check: exact
```

```drill
type: translate
prompt: "Прочитай слово: さかな"
answer: sakana
check: fuzzy
hint: рыба
```

```drill
type: translate
prompt: "Прочитай слово: ともだち"
answer: tomodachi
check: fuzzy
hint: друг
```

```drill
type: translate
prompt: "Прочитай слово: いぬ"
answer: inu
check: fuzzy
hint: собака
```

```drill
type: free-form
prompt: "Прочитай вслух и запиши ромадзи: ねこ と いぬ"
answer: neko to inu — «кошка и собака» (と здесь = «и»)
check: manual
```

## Блок 6. Сокуон (маленькая っ)

```drill
type: translate
prompt: "Прочитай: がっこう"
answer: gakkō | gakkou | gakko
check: fuzzy
hint: школа; っ даёт паузу
```

```drill
type: multiple-choice
prompt: "Что делает маленькая っ?"
options: [читается «цу», удваивает следующий согласный (пауза), удлиняет гласный, ничего не значит]
answer: удваивает следующий согласный (пауза)
check: exact
```

```drill
type: multiple-choice
prompt: "Где написано «муж» (otto), а не «звук» (oto)?"
options: [おと, おっと, おとお, をと]
answer: おっと
check: exact
```

```drill
type: translate
prompt: "Прочитай: きって"
answer: kitte
check: fuzzy
hint: почтовая марка
```

```drill
type: translate
prompt: "Прочитай: ちょっと"
answer: chotto
check: fuzzy
hint: «немного»; тут и ёон, и сокуон
```

## Блок 7. Долгие гласные

```drill
type: multiple-choice
prompt: "Как читается せんせい?"
options: [сэн-сэ-и (три такта в конце), сэнсэ: (долгое «э»), сэнсай, сэнсэй с ударением]
answer: "сэнсэ: (долгое «э»)"
check: exact
hint: え чаще всего тянется через い
```

```drill
type: translate
prompt: "Прочитай: ありがとう"
answer: arigatō | arigatou | arigato
check: fuzzy
hint: спасибо; う тянет «о»
```

```drill
type: multiple-choice
prompt: "おじさん и おじいさん — это:"
options: [одно и то же слово, дядя и дедушка, дедушка и дядя, ошибка записи]
answer: дядя и дедушка
check: exact
hint: долгота смыслоразличительна
```

```drill
type: translate
prompt: "Прочитай: とうきょう"
answer: tōkyō | toukyou | tokyo
check: fuzzy
hint: город
```

## Блок 8. Как это звучит

```drill
type: multiple-choice
prompt: "Почему です на слух звучит как «дэс»?"
options: [это диалект, у в конце проглатывается, す читается как «с» всегда, ошибка в записи]
answer: у в конце проглатывается
check: exact
```

```drill
type: multiple-choice
prompt: "Как звучит ん в こんばんは?"
options: [как «н», как «м», как «нг», не звучит]
answer: как «м»
check: exact
hint: перед b/p/m
```

```drill
type: free-form
prompt: "Своими словами: чем японский ритм отличается от русского в плане ударения?"
answer: В японском нет силового ударения — есть тональный рисунок (высоко/низко), а все такты (моры) примерно одинаковой длины. Русское «биение» по слогу здесь неуместно.
check: manual
```

```drill
type: free-form
prompt: "Запиши ромадзи и объясни, из чего состоит: がっこうに いきます"
answer: gakkō ni ikimasu — «иду в школу». がっこう со сокуоном っ (пауза) и долгим о через う; に — частица; いきます — глагол в конце.
check: manual
```
