# Frontmatter snippets

Copy-paste ready blocks. Replace placeholders, set today's date.

## Generic

```yaml
---
id: <domain>.<module>.<slug>
type: <index|theory|lesson|cards|drills|memory|roadmap>
title: <Название>
tags: [<tag>, ...]
status: todo
updated: YYYY-MM-DD
---
```

## Theory

```yaml
---
id: <domain>.<module>.theory
type: theory
title: <Module> — теория
tags: [<domain>, <module-tag>, theory]
status: todo
updated: YYYY-MM-DD
---
```

## Lesson

```yaml
---
id: <domain>.<module>.lesson-NN
type: lesson
title: Урок NN — <тема>
tags: [<domain>, <module-tag>, lesson]
status: todo
updated: YYYY-MM-DD
---
```

## Cards

```yaml
---
id: <domain>.<module>.cards
type: cards
title: <Module> — карточки
tags: [<domain>, <module-tag>, cards]
status: todo
updated: YYYY-MM-DD
---
```

## Drills

```yaml
---
id: <domain>.<module>.drills
type: drills
title: <Module> — упражнения
tags: [<domain>, <module-tag>, drills]
status: todo
updated: YYYY-MM-DD
---
```

## Domain root (memory / roadmap / README)

```yaml
---
id: <domain>.memory
type: memory
title: Память — <domain>
tags: [<domain>, memory]
updated: YYYY-MM-DD
---
```

```yaml
---
id: <domain>.roadmap
type: roadmap
title: План обучения — <domain>
tags: [<domain>, roadmap]
updated: YYYY-MM-DD
---
```

```yaml
---
id: <domain>.index
type: index
title: <Название домена>
tags: [<domain>]
updated: YYYY-MM-DD
---
```
