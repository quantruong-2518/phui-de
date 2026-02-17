---
name: Supabase Query Builder
description: Helper for building Supabase database queries including joins, filters, search, and pagination.
---

# Supabase Query Builder Patterns

## 1. Check Schema

Before building queries:

- Read `.context/03-database-schema.md`
- Identify tables and relationships

## 2. Build Query Template

```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('column1, column2, related_table(*)')
  .eq('filter_column', value)
  .order('sort_column', { ascending: false })
  .range(start, end);
```

## 3. Common Patterns

### Joins

```typescript
// Select specific columns from related table
.select('*, related_table(id, name)')

// Select all from related
.select('*, related_table(*)')
```

### Filters

```typescript
.eq('column', value)      // Equal
.neq('column', value)     // Not equal
.gt('column', value)      // Greater than
.lt('column', value)      // Less than
.gte('column', value)     // Greater than or equal
.lte('column', value)     // Less than or equal
.in('column', [val1, val2]) // In array
.is('column', null)       // Is null
```

### Search

```typescript
.ilike('column', '%search%') // Case insensitive match
```

### Pagination

```typescript
.range(0, 9) // First 10 items (0-indexed)
```

### Count

```typescript
.select('*', { count: 'exact' })
```

## 4. Error Handling

Always handle errors immediately:

```typescript
if (error) throw error;
```

## When to use

- Creating complex queries
- Need filter/sort/pagination
- Debugging query issues
