# 数据隔离验证文档

## ✅ 数据完全隔离保证

本文档验证 **Next方向** 和 **风灵方向** 的数据完全隔离，绝不会混淆。

---

## 🔒 核心隔离机制

### 1. **数据库层隔离**（Supabase 模式）

#### Next方向
- **表名**: `badcases`
- **所有操作**: 增删改查都在 `badcases` 表

#### 风灵方向
- **表名**: `badcases_fengling`
- **所有操作**: 增删改查都在 `badcases_fengling` 表

```typescript
// BadcaseContext.tsx 第 28-30 行
const getTableName = (business: string) => {
  return business === 'fengling' ? 'badcases_fengling' : 'badcases';
};
```

### 2. **本地存储层隔离**（localStorage 模式）

#### Next方向
- **存储键**: `badcaseList_next`
- **位置**: `localStorage.getItem('badcaseList_next')`

#### 风灵方向
- **存储键**: `badcaseList_fengling`
- **位置**: `localStorage.getItem('badcaseList_fengling')`

```typescript
// BadcaseContext.tsx 第 33-35 行
const getLocalStorageKey = (business: string) => {
  return `badcaseList_${business}`;
};
```

---

## 🛡️ 所有操作的隔离验证

### ✅ 新增操作（addBadcase）

**Supabase 模式：**
```typescript
// 第 238 行
const created = await badcaseApi.createBadcase(
  badcase, 
  getTableName(currentBusiness)  // ← 自动选择正确的表
);
```

**localStorage 模式：**
```typescript
// 第 245-246 行
const storageKey = getLocalStorageKey(currentBusiness);  // ← 自动选择正确的键
localStorage.setItem(storageKey, JSON.stringify(updatedList));
```

**结果：**
- Next → 写入 `badcases` 表 或 `badcaseList_next` 键
- 风灵 → 写入 `badcases_fengling` 表 或 `badcaseList_fengling` 键

---

### ✅ 更新操作（updateBadcase）

**Supabase 模式：**
```typescript
// 第 264 行
const updated = await badcaseApi.updateBadcase(
  id, 
  updates, 
  getTableName(currentBusiness)  // ← 自动选择正确的表
);
```

**localStorage 模式：**
```typescript
// 第 281-282 行
const storageKey = getLocalStorageKey(currentBusiness);  // ← 自动选择正确的键
localStorage.setItem(storageKey, JSON.stringify(updatedList));
```

**结果：**
- Next → 更新 `badcases` 表 或 `badcaseList_next` 键
- 风灵 → 更新 `badcases_fengling` 表 或 `badcaseList_fengling` 键

---

### ✅ 删除操作（deleteBadcase）

**Supabase 模式：**
```typescript
// 第 300 行
await badcaseApi.deleteBadcase(
  id, 
  getTableName(currentBusiness)  // ← 自动选择正确的表
);
```

**localStorage 模式：**
```typescript
// 第 305 行
setBadcaseList((prev) => prev.filter((item) => item.id !== id));
// 然后通过 useEffect 自动保存到对应的 storageKey
```

**结果：**
- Next → 删除 `badcases` 表记录 或 `badcaseList_next` 中的数据
- 风灵 → 删除 `badcases_fengling` 表记录 或 `badcaseList_fengling` 中的数据

---

### ✅ 查询操作（数据加载）

**初始化加载：**
```typescript
// 第 54 行 - Supabase
const data = await badcaseApi.getAllBadcases(getTableName(currentBusiness));

// 第 63 行 - localStorage
const storageKey = getLocalStorageKey(currentBusiness);
const savedData = localStorage.getItem(storageKey);
```

**实时订阅（Realtime）：**
```typescript
// 第 137 行
const tableName = getTableName(currentBusiness);
const channel = supabase
  .channel(`${tableName}-changes`)
  .on('postgres_changes', {
    schema: 'public',
    table: tableName,  // ← 只订阅对应的表
  }, ...)
```

**结果：**
- Next → 加载/订阅 `badcases` 表
- 风灵 → 加载/订阅 `badcases_fengling` 表

---

## 🔍 业务方向切换机制

### 自动切换逻辑

每个页面都会根据 URL 参数自动设置业务方向：

```typescript
// BadcaseListPage.tsx, StatusFlowPage.tsx, DataDashboardPage.tsx
useEffect(() => {
  const business = searchParams.get('business') || 'next';
  setCurrentBusiness(business);  // ← 切换业务方向
}, [searchParams, setCurrentBusiness]);
```

### 切换时的数据重载

```typescript
// BadcaseContext.tsx 第 38-91 行
useEffect(() => {
  const initializeData = async () => {
    // ... 根据 currentBusiness 重新加载数据
  };
  
  initializeData();
}, [currentBusiness]);  // ← 依赖 currentBusiness，切换时自动重新加载
```

---

## 🎯 URL 与数据表映射

| URL | currentBusiness | Supabase 表 | localStorage 键 |
|-----|----------------|-------------|-----------------|
| `/badcase-list?business=next` | `'next'` | `badcases` | `badcaseList_next` |
| `/badcase-list?business=fengling` | `'fengling'` | `badcases_fengling` | `badcaseList_fengling` |
| `/status-flow?business=next` | `'next'` | `badcases` | `badcaseList_next` |
| `/status-flow?business=fengling` | `'fengling'` | `badcases_fengling` | `badcaseList_fengling` |
| `/data-dashboard?business=next` | `'next'` | `badcases` | `badcaseList_next` |
| `/data-dashboard?business=fengling` | `'fengling'` | `badcases_fengling` | `badcaseList_fengling` |

---

## 🧪 测试验证步骤

### 测试 1：创建数据隔离
1. 进入 Next 方向 → 创建一条 Badcase（ID: BC0001）
2. 进入风灵方向 → 创建一条 Badcase（ID: BC0002）
3. **验证**：
   - Next 列表只显示 BC0001
   - 风灵列表只显示 BC0002
   - Supabase `badcases` 表只有 BC0001
   - Supabase `badcases_fengling` 表只有 BC0002

### 测试 2：更新数据隔离
1. 在 Next 方向修改 BC0001 的描述
2. 在风灵方向修改 BC0002 的描述
3. **验证**：
   - BC0001 只在 `badcases` 表中更新
   - BC0002 只在 `badcases_fengling` 表中更新
   - 两个方向的数据互不影响

### 测试 3：删除数据隔离
1. 在 Next 方向删除 BC0001
2. 在风灵方向删除 BC0002
3. **验证**：
   - BC0001 只从 `badcases` 表删除
   - BC0002 只从 `badcases_fengling` 表删除

---

## 🚨 防混淆机制

### 1. **表名动态选择**
所有数据库操作都通过 `getTableName(currentBusiness)` 动态选择表，**不存在硬编码的表名**。

### 2. **存储键动态选择**
所有 localStorage 操作都通过 `getLocalStorageKey(currentBusiness)` 动态选择键。

### 3. **业务方向状态管理**
`currentBusiness` 是 Context 的状态，所有操作都基于这个状态，确保一致性。

### 4. **实时订阅隔离**
Realtime 订阅也是按表名隔离的，切换业务方向时会取消旧订阅，创建新订阅。

---

## ✅ 结论

**数据隔离保证：**

✅ **数据库层完全隔离** - 使用不同的表  
✅ **本地存储完全隔离** - 使用不同的键  
✅ **增删改查完全隔离** - 所有操作都带业务方向参数  
✅ **实时同步完全隔离** - 订阅不同的表  
✅ **切换时自动重载** - 不会残留旧数据  

**绝对不会出现以下情况：**

❌ Next 的数据出现在风灵列表中  
❌ 风灵的数据出现在 Next 列表中  
❌ 修改 Next 数据影响到风灵数据  
❌ 删除风灵数据影响到 Next 数据  

---

## 📝 代码审查清单

- [x] `getTableName()` 正确映射表名
- [x] `getLocalStorageKey()` 正确映射存储键
- [x] `addBadcase()` 使用 `getTableName(currentBusiness)`
- [x] `updateBadcase()` 使用 `getTableName(currentBusiness)`
- [x] `deleteBadcase()` 使用 `getTableName(currentBusiness)`
- [x] `getAllBadcases()` 使用 `getTableName(currentBusiness)`
- [x] Realtime 订阅使用 `getTableName(currentBusiness)`
- [x] localStorage 保存使用 `getLocalStorageKey(currentBusiness)`
- [x] 页面切换时更新 `currentBusiness`
- [x] `currentBusiness` 变化时重新加载数据

**最终结论：代码实现完全保证数据隔离，无混淆风险。** ✅
