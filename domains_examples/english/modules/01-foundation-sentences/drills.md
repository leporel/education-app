---
id: english.foundation-sentences.drills
type: drills
title: "Каркас предложения — упражнения"
tags: [english, foundation, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

Главная цель модуля — **собирать предложения самому**, поэтому большинство дриллов на
перевод RU→EN. Ответы проверяются `fuzzy` (регистр/мелочи не критичны), но следи за
`to be`, `-s` и порядком слов — именно они тут проверяются.

## Блок 1. Порядок слов (SVO)

```drill
type: translate
prompt: "Собери по SVO: Я вижу проблему."
answer: I see a problem. | I see the problem.
check: fuzzy
hint: кто → что делает → над чем
```

```drill
type: multiple-choice
prompt: "Какой порядок слов правильный для «Она любит кофе»?"
options: [Coffee she likes., She likes coffee., Likes she coffee., She coffee likes.]
answer: She likes coffee.
check: exact
```

```drill
type: translate
prompt: "Собери: Мы знаем этих людей. (people)"
answer: We know these people. | We know those people.
check: fuzzy
hint: We → без -s; people идёт после глагола
```

```drill
type: free-form
prompt: "Что меняется в смысле между «The cat sees the dog» и «The dog sees the cat»? Объясни своими словами."
answer: "Меняется, кто действует, а кто объект: в первом кошка видит собаку, во втором — собака видит кошку. Смысл задаётся порядком слов, а не окончаниями."
check: manual
```

## Блок 2. `to be` (am / is / are)

```drill
type: fill-in
prompt: "I ___ a developer."
answer: am
check: exact
```

```drill
type: fill-in
prompt: "She ___ at home now."
answer: is
check: exact
```

```drill
type: fill-in
prompt: "They ___ very happy today."
answer: are
check: exact
```

```drill
type: translate
prompt: "Переведи: Я устал."
answer: I am tired. | I'm tired.
check: fuzzy
hint: описание состояния → нужен to be
```

```drill
type: translate
prompt: "Переведи (про погоду): Холодно."
answer: It is cold. | It's cold.
check: fuzzy
hint: нет подлежащего → ставим заглушку it
```

```drill
type: multiple-choice
prompt: "Где ошибка русскоговорящего?"
options: [I am a student., She is happy., We here., It is cold.]
answer: We here.
check: exact
hint: потерян глагол to be → должно быть "We are here."
```

## Блок 3. Present simple и `-s`

```drill
type: fill-in
prompt: "He ___ here. (work)"
answer: works
check: exact
hint: he → 3-е лицо ед. ч. → +s
```

```drill
type: fill-in
prompt: "I ___ here. (work)"
answer: work
check: exact
hint: I → без -s
```

```drill
type: fill-in
prompt: "She ___ to work every day. (go)"
answer: goes
check: exact
hint: go + es после -o
```

```drill
type: translate
prompt: "Переведи: Она пьёт кофе. (drink)"
answer: She drinks coffee.
check: fuzzy
hint: she → не забудь -s
```

```drill
type: translate
prompt: "Переведи: Мы живём здесь. (live)"
answer: We live here.
check: fuzzy
hint: we → без -s
```

```drill
type: multiple-choice
prompt: "Выбери правильное предложение:"
options: [They works here., He work here., She studys English., He studies English.]
answer: He studies English.
check: exact
```

## Блок 4. Собрать всё вместе (микс)

```drill
type: translate
prompt: "Переведи: Я хочу воды."
answer: I want water. | I want some water.
check: fuzzy
```

```drill
type: translate
prompt: "Переведи: Он знает этих людей."
answer: He knows these people. | He knows those people.
check: fuzzy
hint: he → knows (с -s)
```

```drill
type: translate
prompt: "Переведи: Кофе горячий."
answer: The coffee is hot. | Coffee is hot.
check: fuzzy
hint: описание → to be (is)
```

```drill
type: translate
prompt: "Переведи: Они работают сегодня."
answer: They work today. | Today they work.
check: fuzzy
hint: they → без -s
```

```drill
type: translate
prompt: "Переведи: Она очень счастлива."
answer: She is very happy. | She's very happy.
check: fuzzy
```

```drill
type: free-form
prompt: "Напиши 3 своих предложения про себя: одно с to be (какой ты), одно действие в present simple, и одно про he/she с -s."
answer: "Например: I am a programmer. I drink coffee every day. She works with me. (главное — to be на месте, -s у he/she/it, порядок SVO)"
check: manual
```

## Блок 5. Местоимения: «кого/кому» и «чей»

```drill
type: fill-in
prompt: "She knows ___ . (меня)"
answer: me
check: exact
hint: после глагола → me
```

```drill
type: fill-in
prompt: "Come with ___ . (с нами)"
answer: us
check: exact
hint: после предлога → us
```

```drill
type: multiple-choice
prompt: "«Мы знаем их» — выбери правильное:"
options: [We know they., Us know them., We know them., We knows them.]
answer: We know them.
check: exact
```

```drill
type: fill-in
prompt: "This is ___ house, and that house is ___ . (наш / наш — через запятую)"
answer: our, ours
check: fuzzy
hint: перед существительным our, без него ours
```

```drill
type: translate
prompt: "Переведи: Кошка моей сестры очень большая."
answer: My sister's cat is very big.
check: fuzzy
hint: владелец вперёд + 's
```

```drill
type: multiple-choice
prompt: "Где ошибка?"
options: [It's cold today., The dog and its bowl., Its raining now., This car is mine.]
answer: Its raining now.
check: exact
hint: «идёт дождь» → It's (= it is) raining
```

## Блок 6. Множественное число

```drill
type: fill-in
prompt: "Множественное: box → ___ , city → ___ , knife → ___ (через запятую)"
answer: boxes, cities, knives
check: fuzzy
```

```drill
type: multiple-choice
prompt: "Где ошибка?"
options: [two men, three children, four persons (о людях в быту), five books]
answer: four persons (о людях в быту)
check: exact
hint: в быту множественное от person — people
```

```drill
type: fill-in
prompt: "These ___ (people) ___ (be) very nice. — вставь формы"
answer: people, are
check: fuzzy
hint: people — уже множественное → are
```

```drill
type: multiple-choice
prompt: "Где правильно расставлена -s?"
options: [The cats sleeps., The cat sleeps., The cats sleep., оба варианта 2 и 3]
answer: оба варианта 2 и 3
check: exact
hint: -s стоит либо у существительного (много), либо у глагола (he/she/it) — но не у обоих
```

## Блок 7. «У меня есть» и звуки

```drill
type: translate
prompt: "Переведи: У меня есть кошка и две собаки."
answer: I have a cat and two dogs.
check: fuzzy
hint: «у меня есть» → have; не забудь -s у dogs
```

```drill
type: fill-in
prompt: "She ___ two children. (have)"
answer: has
check: exact
hint: 3-е лицо ед. ч. → has
```

```drill
type: multiple-choice
prompt: "В каком слове первая буква НЕ читается?"
options: [work, know, table, cold]
answer: know
check: exact
hint: know [nəʊ] — k молчит
```

```drill
type: free-form
prompt: "Объясни своими словами, зачем нужна транскрипция в квадратных скобках, и приведи два слова, где написание врёт про звук."
answer: "Написание и произношение в английском разошлись, по буквам звук не угадать; транскрипция — точный источник. Примеры: know [nəʊ] (k молчит), hour [ˈaʊə(r)] (h молчит)."
check: manual
```
