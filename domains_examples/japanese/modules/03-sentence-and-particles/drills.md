---
id: japanese.sentence-and-particles.drills
type: drills
title: "Предложение и частицы — упражнения"
tags: [japanese, grammar, particles, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

Выбор частиц и сборка предложений. Помни: сказуемое — в конец, частица — после слова.

## Блок 1. です и は

```drill
type: translate
prompt: "Собери: Я студент. (わたし — я, がくせい — студент)"
answer: わたしは がくせいです。 | わたしはがくせいです
check: fuzzy
```

```drill
type: fill-in
prompt: "これ___ ペンです。 (вставь частицу темы)"
answer: は
check: exact
hint: тема → は (читается wa)
```

```drill
type: multiple-choice
prompt: "Как читается частица は в これは?"
options: [ha, wa, a, ba]
answer: wa
check: exact
```

```drill
type: translate
prompt: "Собери: Я японец. (にほんじん — японец)"
answer: わたしは にほんじんです。 | わたしはにほんじんです
check: fuzzy
```

## Блок 2. を (объект)

```drill
type: fill-in
prompt: "みず___ のみます。 (вставь частицу объекта)"
answer: を
check: exact
hint: объект → を (читается o)
```

```drill
type: translate
prompt: "Собери: (Я) читаю книгу. (ほん — книга, よみます — читать)"
answer: ほんを よみます。 | ほんをよみます | わたしは ほんを よみます。
check: fuzzy
hint: подлежащее можно опустить
```

```drill
type: multiple-choice
prompt: "Где правильный порядок «Я воду пью»?"
options: [わたしは のみます みずを, わたしは みずを のみます, みずを わたしは のみます, のみます わたしは みずを]
answer: わたしは みずを のみます
check: exact
hint: сказуемое в конце
```

## Блок 3. の (принадлежность)

```drill
type: translate
prompt: "Собери: моя книга (わたし — я, ほん — книга)"
answer: わたしの ほん | わたしのほん
check: fuzzy
```

```drill
type: multiple-choice
prompt: "«японская машина» (にほん — Япония, くるま — машина):"
options: [くるまの にほん, にほんの くるま, にほん くるまの, くるま にほんの]
answer: にほんの くるま
check: exact
hint: "владелец первый: A の B"
```

```drill
type: translate
prompt: "Собери: Это моя книга. (これ — это)"
answer: これは わたしの ほんです。 | これはわたしのほんです
check: fuzzy
```

## Блок 4. が и скрытое подлежащее

```drill
type: fill-in
prompt: "だれ___ きましたか。 (кто пришёл? — частица к вопросу «кто»)"
answer: が
check: exact
hint: конкретный деятель / вопрос «кто» → が
```

```drill
type: free-form
prompt: "В предложении «みずを のみます» нет слова «я». Почему это нормально?"
answer: Подлежащее опущено (скрытое/ゼロ-подлежащее) — из контекста ясно, что речь обо мне. Японский опускает понятное из контекста.
check: manual
```

```drill
type: free-form
prompt: "Объясни роль каждой частицы в «わたしは みずを のみます»."
answer: わたし+は — тема («что касается меня»); みず+を — объект (что пью — воду); のみます — сказуемое (пить) в конце.
check: manual
```

## Блок 5. Вопрос か и вопросительные слова

```drill
type: fill-in
prompt: "Сделай вопрос: たなかさんは がくせいです___"
answer: か
check: exact
```

```drill
type: multiple-choice
prompt: "«Что это?» — выбери правильное:"
options: [なんですか これは。, これは なんですか。, これは なにですか。, か これは なんです。]
answer: これは なんですか。
check: exact
hint: перед です — なん, порядок не меняется
```

```drill
type: translate
prompt: "Собери: Где туалет? (トイレ, どこ)"
answer: トイレは どこですか。 | トイレはどこですか
check: fuzzy
```

```drill
type: translate
prompt: "Собери: Сколько стоит? (いくら)"
answer: いくらですか。 | いくらですか
check: fuzzy
```

```drill
type: multiple-choice
prompt: "Чем японский вопрос удобнее английского?"
options: [в нём нет вопросительных слов, порядок слов не меняется — просто добавляется か, он короче на слог, в нём нет интонации]
answer: порядок слов не меняется — просто добавляется か
check: exact
```

## Блок 6. も / と / ね / よ

```drill
type: fill-in
prompt: "たなかさん___ がくせいです。 (Танака ТОЖЕ студент)"
answer: も
check: exact
hint: も вытесняет は
```

```drill
type: multiple-choice
prompt: "Где ошибка?"
options: [わたしも わかりません。, たなかさんも きました。, たなかさんはも がくせいです。, ねこも いぬも すきです。]
answer: たなかさんはも がくせいです。
check: exact
```

```drill
type: fill-in
prompt: "ともだち___ いきます。 (иду С другом)"
answer: と
check: exact
```

```drill
type: multiple-choice
prompt: "«Вкусно, правда?» — какая частица в конце?"
options: [か, よ, ね, の]
answer: ね
check: exact
hint: ね ищет согласия, よ сообщает новое
```

## Блок 7. Указатели こそあど

```drill
type: multiple-choice
prompt: "«Эта книга дорогая» (たかい — дорогой):"
options: [これ ほんは たかいです。, この ほんは たかいです。, これは ほん たかいです。, その たかいです ほんは。]
answer: この ほんは たかいです。
check: exact
hint: この требует существительное
```

```drill
type: multiple-choice
prompt: "Вещь находится в руках у собеседника. Как на неё указать?"
options: [これ, それ, あれ, どれ]
answer: それ
check: exact
```

```drill
type: fill-in
prompt: "Заполни ряд «место»: ここ / ___ / あそこ / どこ"
answer: そこ
check: exact
```

```drill
type: translate
prompt: "Собери: Дайте вон то (что у вас). (ください — дайте)"
answer: それを ください。 | それをください
check: fuzzy
```

```drill
type: free-form
prompt: "Объясни своими словами разницу между これ и この, приведи по примеру."
answer: "これ стоит само и значит «это»: これは ほんです (это книга). この — определение и требует существительного: この ほんは たかいです (эта книга дорогая). ❌ これ ほん, ❌ この は."
check: manual
```

## Блок 8. Обращения

```drill
type: multiple-choice
prompt: "Как правильно представиться (фамилия Танака)?"
options: [わたしは たなかさんです。, わたしは たなかです。, たなかさんは わたしです。, あなたは たなかです。]
answer: わたしは たなかです。
check: exact
hint: さん к себе не ставят
```

```drill
type: multiple-choice
prompt: "Как вежливее спросить собеседника-Танаку, студент ли он?"
options: [あなたは がくせいですか。, たなかさんは がくせいですか。, きみは がくせいか。, わたしは がくせいですか。]
answer: たなかさんは がくせいですか。
check: exact
hint: вместо あなた — фамилия с さん
```

```drill
type: free-form
prompt: "Составь мини-диалог из трёх реплик: спроси, что это; получи ответ «это книга»; уточни «а это тоже книга?» (используй も)."
answer: "Например: これは なんですか。 — それは ほんです。 — これも ほんですか。 (проверь: か в конце, も вместо は, これ/それ по расстоянию)"
check: manual
```
