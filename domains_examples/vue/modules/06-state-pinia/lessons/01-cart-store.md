---
id: vue.state-pinia.lesson-01
type: lesson
title: "Урок 01 — Стор корзины"
tags: [vue, pinia, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Стор корзины

Цель: вынести корзину магазина в Pinia-стор и использовать его сразу из двух несвязанных
компонентов — шапки (счётчик) и каталога (кнопка «добавить»). Это перекличка с корзиной из
TS-домена, только теперь состояние живёт централизованно.

## Разогрев

- Почему корзина — кандидат в стор, а не в `ref` компонента?
- Как достать из стора реактивные значения и действия по-разному?

## Шаг 1. Стор корзины (setup-стиль)

```ts
// src/stores/cart.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface Product {
  id: number;
  title: string;
  priceCents: number;        // цена в копейках — целое (помним про float из TS-домена)
}

interface CartLine {
  product: Product;
  qty: number;
}

export const useCartStore = defineStore("cart", () => {
  // --- state ---
  const lines = ref<CartLine[]>([]);

  // --- getters ---
  const count = computed(() => lines.value.reduce((sum, l) => sum + l.qty, 0));
  const totalCents = computed(() =>
    lines.value.reduce((sum, l) => sum + l.product.priceCents * l.qty, 0),
  );
  const isEmpty = computed(() => lines.value.length === 0);

  // --- actions ---
  function add(product: Product): void {
    const existing = lines.value.find((l) => l.product.id === product.id);
    if (existing) {
      existing.qty++;                       // уже есть — увеличиваем количество
    } else {
      lines.value.push({ product, qty: 1 }); // нет — добавляем строку
    }
  }

  function remove(productId: number): void {
    lines.value = lines.value.filter((l) => l.product.id !== productId);
  }

  function clear(): void {
    lines.value = [];
  }

  return { lines, count, totalCents, isEmpty, add, remove, clear };
});
```

Всё знакомое: `state` — `ref`, `getters` — `computed`, `actions` — функции. Логика «добавить
или увеличить» живёт в **одном** месте — в action `add`, а не размазана по компонентам.

## Шаг 2. Шапка читает счётчик

```vue
<!-- CartBadge.vue (в шапке) -->
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCartStore } from "@/stores/cart";

const cart = useCartStore();
const { count, totalCents } = storeToRefs(cart);   // реактивные геттеры
</script>

<template>
  <span class="badge">🛒 {{ count }} ({{ (totalCents / 100).toFixed(2) }} ₽)</span>
</template>
```

## Шаг 3. Каталог вызывает действие

```vue
<!-- ProductCard.vue (в каталоге) -->
<script setup lang="ts">
import { useCartStore, type Product } from "@/stores/cart";

defineProps<{ product: Product }>();

const cart = useCartStore();      // тот же экземпляр стора, что и в шапке!
// action берём прямо со стора — оборачивать в storeToRefs не нужно
</script>

<template>
  <article>
    <h3>{{ product.title }}</h3>
    <p>{{ (product.priceCents / 100).toFixed(2) }} ₽</p>
    <button @click="cart.add(product)">В корзину</button>
  </article>
</template>
```

Нажал «В корзину» в каталоге — счётчик в шапке обновился сам. Два компонента, которые
ничего не знают друг о друге, делят одно состояние через стор. Никаких props через пол-дерева.

## Шаг 4. Намеренно ошибёмся

```ts
// ❌ деструктурируем стор напрямую — теряем реактивность
const cart = useCartStore();
const { count } = cart;          // count «застынет» — это снимок, не реактивная ссылка
```

Счётчик в шапке перестанет обновляться: `count` стал обычным числом на момент
деструктуризации. Лечение — `storeToRefs(cart)`.

```ts
// ❌ прогнали action через storeToRefs
const { add } = storeToRefs(cart);   // неверно: add — функция, не состояние
// add надо брать прямо: const { add } = cart;
```

```vue
<!-- ❌ продублировали логику «добавить или увеличить» в компоненте -->
<button @click="
  cart.lines.find(l => l.product.id === product.id)
    ? cart.lines.find(l => l.product.id === product.id)!.qty++
    : cart.lines.push({ product, qty: 1 })
">В корзину</button>
```

Логика расползлась по шаблону, и если правил поменяется (лимит количества, скидки) —
чинить придётся в каждом месте. Для этого и существует action `add`: одно место истины.

## Mini-drill

```drill
type: free-form
prompt: "Добавь action setQty(productId, qty): если qty <= 0 — удалить строку, иначе выставить количество. Где это писать и почему не в компоненте?"
answer: "В сторе как action: function setQty(id, qty){ if (qty <= 0) { remove(id); return; } const line = lines.value.find(l => l.product.id === id); if (line) line.qty = qty; }. В сторе — потому что это бизнес-логика изменения состояния: одно место истины, переиспользование, видно в devtools."
check: manual
```

```drill
type: multiple-choice
prompt: "Шапка показывает count из стора. Что взять, чтобы счётчик жил реактивно?"
options: ["const { count } = cart", "const { count } = storeToRefs(cart)", "const count = cart.count.value", "provide(count)"]
answer: "const { count } = storeToRefs(cart)"
check: exact
```

```drill
type: free-form
prompt: "totalCents — это getter (computed). Почему не хранить total как отдельное поле state и не обновлять в add/remove?"
answer: "Это производное от lines значение — его выводят (computed/getter), а не хранят. Отдельное поле пришлось бы синхронизировать во всех действиях и легко рассинхронить (та же логика, что ref vs computed в модуле 01)."
check: manual
```

## Итог

Корзина переехала в Pinia: `state` (строки), `getters` (count/total/isEmpty),
`actions` (add/remove/clear) — и сразу обслуживает несвязанные компоненты, которые делят
один экземпляр стора. Ключевые мышцы: **state/getters доставай через `storeToRefs`, actions
— прямо со стора**, и **бизнес-логику изменения держи в actions, а не в шаблонах**. Дальше —
финальный модуль: подтянуть данные с сервера, протестировать и собрать всё в работающий
проект.
