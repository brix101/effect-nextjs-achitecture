# Effect + Next.js Architecture Demo

A minimal, runnable demo of a **production-tested full-stack architecture** using [Effect.ts](https://effect.website) and [Next.js 16](https://nextjs.org) (App Router).

> This repo is extracted and simplified from a production application. The pattern has been battle-tested with real users and real complexity.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  use-*.ts    │  │  React Query │  │  Components   │  │
│  │  (hooks)     │──│  (cache)     │──│  (UI)         │  │
│  └──────┬───────┘  └──────────────┘  └───────────────┘  │
│         │                                               │
├─────────┼───────────────────────────────────────────────┤
│         │          Server Boundary                      │
│  ┌──────▼───────┐  ┌──────────────┐                     │
│  │  queries.ts  │  │  actions.ts  │  (route-colocated)  │
│  │  "use server" │  │  "use server" │                    │
│  └──────┬───────┘  └──────┬───────┘                     │
│         │                 │                             │
│  ┌──────▼───────┐  ┌──────▼───────┐                     │
│  │  server.ts   │  │  action      │  (builders)         │
│  │  (SSR data)  │  │  builder     │                     │
│  └──────┬───────┘  └──────┬───────┘                     │
│         │                 │                             │
│  ┌──────▼─────────────────▼───────┐                     │
│  │        ManagedRuntime          │                     │
│  │  ┌───────────────────────────┐ │                     │
│  │  │    Services (business)    │ │  Layer 3            │
│  │  ├───────────────────────────┤ │                     │
│  │  │    Repositories (data)    │ │  Layer 2            │
│  │  ├───────────────────────────┤ │                     │
│  │  │    Infrastructure (DB)    │ │  Layer 1            │
│  │  └───────────────────────────┘ │                     │
│  └────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
app/
├── lib/
│   ├── page-builder.tsx    # SSR page/layout builder with fluent API
│   ├── actions.ts          # Server action builder with schema validation
│   ├── errors.ts           # Shared tagged error types
│   ├── api-response.ts     # Client-safe response envelope + unwrap helper
│   └── auth.ts             # Auth simulation (getUserId)
│
├── server/
│   ├── runtime.ts          # ManagedRuntime with layered dependencies
│   ├── shared/
│   │   └── infrastructure/
│   │       └── database.ts # In-memory database service (Service + Layer)
│   └── features/
│       ├── todo/
│       │   ├── todo.schema.ts      # Effect Schema + derived types
│       │   ├── todo.repository.ts  # Data access (Service + Layer)
│       │   └── todo.service.ts     # Business logic (Service + Layer)
│       └── project/
│           ├── project.schema.ts
│           ├── project.repository.ts
│           └── project.service.ts
│
├── (app)/                  # Route group
│   ├── layout.tsx          # App shell with navigation
│   ├── todos/
│   │   ├── page.tsx        # SSR entry using page builder
│   │   ├── server.ts       # Effect queries (SSR source of truth)
│   │   ├── queries.ts      # 'use server' wrappers for React Query
│   │   ├── actions.ts      # 'use server' mutations via action builder
│   │   ├── use-todos.ts    # React Query hooks
│   │   ├── schemas.ts      # Effect.Schema validation
│   │   └── todo-list.tsx   # Client component
│   └── projects/
│       ├── page.tsx
│       ├── server.ts
│       ├── queries.ts
│       ├── actions.ts
│       ├── use-projects.ts
│       ├── schemas.ts
│       └── project-list.tsx
│
├── components/
│   └── error-card.tsx      # Error display component
├── providers.tsx           # React Query provider
└── layout.tsx              # Root layout
```

## Key Patterns

### Page Builder (`app/lib/page-builder.tsx`)

Fluent API that connects Next.js pages to the Effect runtime:

```typescript
// SSR page with auth + data fetching
export default page
  .protectedEffect(({ userId }) => getTodos(userId))
  .render((todos) => <TodoList initialData={todos} />);

// With params validation
export default page
  .params(ParamsSchema)
  .protectedEffect(({ params, userId }) => getTodo(params.id, userId))
  .render((todo) => <TodoDetail todo={todo} />);
```

Automatically handles:
- `NotFoundError` → Next.js 404
- Redirect errors → re-thrown
- Other errors → `<ErrorCard />`

### Action Builder (`app/lib/actions.ts`)

Type-safe server actions with schema validation:

```typescript
const _createTodo = action
  .schema(CreateTodoInput)
  .protectedEffect(({ input, userId }) =>
    Effect.gen(function* () {
      const service = yield* TodoService;
      return yield* service.create({ title: input.title, userId });
    })
  );

// Next.js requires directly declared async functions
export async function createTodo(input) {
  return _createTodo(input);
}
```

Returns `{ success: true, data } | { success: false, error: { type, message } }`.

### Runtime Composition (`app/server/runtime.ts`)

Layered dependency injection:

```typescript
// Layer 1: Infrastructure
const DatabaseLive = ...

// Layer 2: Repositories (depend on Database)
const RepositoriesLive = Layer.mergeAll(
  TodoRepositoryLive,
  ProjectRepositoryLive,
).pipe(Layer.provide(DatabaseLive));

// Layer 3: Services (depend on Repositories)
const ServicesLive = Layer.mergeAll(
  TodoServiceLive,
  ProjectServiceLive,
).pipe(Layer.provide(RepositoriesLive));

// Single shared runtime
export const runtime = ManagedRuntime.make(ServicesLive);
```

### Route-Level Colocation

Each feature route contains everything needed:

| File | Purpose |
|------|---------|
| `page.tsx` | SSR entry point using page builder |
| `server.ts` | Effect queries (source of truth) |
| `queries.ts` | `"use server"` wrappers for React Query |
| `actions.ts` | `"use server"` mutations via action builder |
| `use-*.ts` | React Query hooks (client) |
| `schemas.ts` | Effect.Schema input validation |
| `*-list.tsx` | Client component |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see a todo app with two pages (Todos and Projects).

> **Note:** Data is stored in-memory and resets on server restart. This is intentional — the demo focuses on architecture, not persistence.

## Dependencies

- **Next.js 16** — App Router, Server Actions, React Server Components
- **Effect.ts v4** — Typed errors, dependency injection, schema validation
- **React Query** — Client-side cache and mutation state management
- **Tailwind CSS v4** — Minimal styling

## License

MIT
