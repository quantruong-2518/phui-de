# Common Tasks

## 1. Tạo trang mới

### Input cho agent:

```
Tạo trang /players với:
- Hiển thị table cầu thủ
- Search bar
- Nút "Thêm cầu thủ"
- Pagination

Context cần đọc:
- 04-component-patterns.md
- 06-hook-patterns.md
```

### Steps:

1. Tạo `app/(dashboard)/players/page.tsx`
2. Fetch data với `usePlayers` hook
3. Dùng `PlayerTable` component
4. Add search functionality

---

## 2. Tạo API endpoint mới

### Input cho agent:

```
Tạo API GET /api/players/leaderboard:
- Top 10 players by points
- Return: { data: Player[] }

Context cần đọc:
- 05-api-patterns.md
- 03-database-schema.md
```

### Steps:

1. Tạo `app/api/players/leaderboard/route.ts`
2. Query Supabase
3. Error handling
4. Return JSON

---

## 3. Tạo form mới

### Input cho agent:

```
Tạo form create player với:
- Fields: name, code, position
- Validation (Zod)
- Submit button
- Toast notifications

Context cần đọc:
- 04-component-patterns.md
- 06-hook-patterns.md
```

### Steps:

1. Tạo Zod schema: `features/players/validations/player-schema.ts`
2. Tạo component: `components/players/PlayerForm.tsx`
3. Tạo hook: `features/players/hooks/use-create-player.ts`
4. Wire up form

---

## 4. Add feature mới

### Input cho agent:

```
Add feature: Player stats chart
- Line chart goals per month
- Dùng shadcn chart
- Data từ API

Context cần đọc:
- 04-component-patterns.md
- 05-api-patterns.md
- 06-hook-patterns.md
```

### Steps:

1. Tạo API: `app/api/players/[id]/stats/route.ts`
2. Tạo hook: `features/players/hooks/use-player-stats.ts`
3. Tạo component: `components/players/PlayerStatsChart.tsx`
4. Add to player detail page

---

## 5. Import Excel data

### Input cho agent:

```
Script import Excel data vào Supabase:
- Read Passion_2024.xlsx
- Map to Player/Match types
- Insert to database

Context cần đọc:
- 03-database-schema.md
```

### Steps:

1. Tạo `scripts/import-excel.ts`
2. Read Excel với `xlsx`
3. Map data
4. Bulk insert Supabase

---

## 6. Fix bug

### Input cho agent:

```
Bug: Player table không sort
File: components/players/PlayerTable.tsx

Context cần đọc:
- 04-component-patterns.md
```

### Steps:

1. Xem code hiện tại
2. Identify issue
3. Fix với useMemo/sort
4. Test

---

## Template prompt cho agent

```
Task: [Mô tả task]

Context files cần đọc:
- .context/XX-YYY.md
- .context/ZZ-AAA.md

Requirements:
- [Requirement 1]
- [Requirement 2]

Output:
- Files cần tạo/sửa
- Code changes
```

---

## 🎯 **WORKFLOW DÙNG CONTEXT FILES**

### **Khi bắt đầu session:**

```
Agent, đọc:
- .context/00-project-overview.md
- .context/01-tech-stack.md
- .context/02-folder-structure.md
```

### **Khi code component:**

```
Agent, đọc:
- .context/04-component-patterns.md
- .context/07-styling-guide.md

Sau đó tạo PlayerCard component theo pattern
```

### **Khi code API:**

```
Agent, đọc:
- .context/05-api-patterns.md
- .context/03-database-schema.md

Sau đó tạo GET /api/players/leaderboard
```

### **Khi code hook:**

```
Agent, đọc:
- .context/06-hook-patterns.md

Sau đó tạo usePlayers hook
```

✅ CHECKLIST SETUP
Tạo script tự động:
File: scripts/setup-context.sh
bash#!/bin/bash

mkdir -p .context

cat > .context/00-project-overview.md << 'EOF'

# [Paste nội dung từ trên]

EOF

cat > .context/01-tech-stack.md << 'EOF'

# [Paste nội dung từ trên]

EOF

# ... tương tự cho các file khác

echo "✅ Context files created!"
