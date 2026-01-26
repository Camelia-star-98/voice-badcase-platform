# 风灵方向与 Next 方向业务差异配置

## 📋 业务差异总结

### 优先级差异

#### Next方向
- **优先级选项**: P00、P0、P1、P2（4个）
- **P00**: 立刻修复（红色）
- **P0**: 多天内修复（橙色）
- **P1**: 多周内修复（蓝色）
- **P2**: 可先不修（灰色）

#### 风灵方向
- **优先级选项**: P0、P1、P2（3个，无 P00）
- **P0**: 多天内修复（橙色）
- **P1**: 多周内修复（蓝色）
- **P2**: 可先不修（灰色）

### 分类差异

#### Next方向
- **扁平分类结构**
- 分类选项：
  - 读音错误
  - 停顿不当
  - 重读不对
  - 语速突变
  - 音量突变
  - 音质问题
  - 其他

#### 风灵方向
- **两层分类结构**（主分类 + 子分类）

**主分类**：
  1. TTS（Text-to-Speech）
  2. ASR（Automatic Speech Recognition）
  3. VAD（Voice Activity Detection）

**子分类**：

**TTS 子分类**：
  - TTS-读音错误
  - TTS-停顿不当
  - TTS-重读不对
  - TTS-语速突变
  - TTS-音量突变
  - TTS-音质问题
  - TTS-其他

**ASR 子分类**：
  - ASR-识别错误
  - ASR-漏识别
  - ASR-误识别
  - ASR-响应慢
  - ASR-其他

**VAD 子分类**：
  - VAD-截断问题
  - VAD-延迟问题
  - VAD-灵敏度问题
  - VAD-其他

---

## 🔧 技术实现

### 配置文件结构

```
src/constants/
├── nextConfig.ts          # Next 方向配置
├── fenglingConfig.ts      # 风灵方向配置
├── businessConfig.ts      # 配置工厂（统一接口）
└── categories.ts          # 旧的通用配置（保留兼容）
```

### 核心API

#### 1. 获取优先级选项
```typescript
import { getPriorityOptions } from '../constants/businessConfig';

const options = getPriorityOptions('next');      // 返回 P00, P0, P1, P2
const options = getPriorityOptions('fengling');  // 返回 P0, P1, P2
```

#### 2. 获取优先级显示
```typescript
import { getPriorityColor, getPriorityText } from '../constants/businessConfig';

const color = getPriorityColor('P0', 'next');      // 返回 'orange'
const text = getPriorityText('P0', 'fengling');    // 返回 'P0：多天内修复'
```

#### 3. 获取分类选项
```typescript
import { getCategoryOptions, getAllCategoryOptions } from '../constants/businessConfig';

// Next: 返回扁平分类列表
const nextCategories = getCategoryOptions('next');

// 风灵: 返回主分类列表 (TTS, ASR, VAD)
const fenglingMainCategories = getCategoryOptions('fengling');

// 风灵: 返回所有子分类（用于筛选）
const allSubcategories = getAllCategoryOptions('fengling');
```

#### 4. 获取风灵子分类
```typescript
import { getSubcategoryOptions } from '../constants/businessConfig';

// 根据主分类获取子分类
const ttsSubcategories = getSubcategoryOptions('TTS', 'fengling');
// 返回: [{value: 'TTS-读音错误', label: '读音错误'}, ...]
```

#### 5. 分类显示格式化
```typescript
import { getCategoryLabel } from '../constants/businessConfig';

// 风灵：'TTS-读音错误' → 'TTS - 读音错误'
const label = getCategoryLabel('TTS-读音错误', 'fengling');

// Next：'读音错误' → '读音错误'
const label = getCategoryLabel('读音错误', 'next');
```

---

## 📝 已修改的组件

### 1. BadcaseListPage.tsx

#### 修改内容：

**表格列定义**：
- ✅ 分类列：根据业务方向显示不同的筛选器
- ✅ 优先级列：根据业务方向显示不同的选项和排序

**上传表单**：
- ✅ Next 方向：显示扁平的分类选择器
- ✅ 风灵方向：显示两层选择器（主分类 → 子分类）
- ✅ 优先级：根据业务方向显示对应的选项

**代码示例**：
```typescript
{business === 'fengling' ? (
  <>
    <Form.Item name="mainCategory" label="主分类">
      <Select onChange={(value) => setSelectedMainCategory(value)}>
        {FENGLING_MAIN_CATEGORIES.map(option => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </Form.Item>
    
    <Form.Item name="category" label="子分类">
      <Select disabled={!selectedMainCategory}>
        {getFenglingSubcategories(selectedMainCategory).map(option => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </Form.Item>
  </>
) : (
  <Form.Item name="category" label="分类">
    <Select>
      {CATEGORY_OPTIONS.map(option => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
  </Form.Item>
)}
```

### 2. StatusFlowPage.tsx（待修改）

需要修改：
- 优先级显示和筛选
- 分类显示
- 详情编辑表单

### 3. DataDashboardPage.tsx（待修改）

需要修改：
- 优先级统计图表
- 分类统计图表

---

## 🎯 数据格式

### 数据库字段（category）

**Next 方向示例**：
```json
{
  "category": "读音错误"
}
```

**风灵方向示例**：
```json
{
  "category": "TTS-读音错误"
}
```

### 数据库字段（priority）

**Next 方向示例**：
```json
{
  "priority": "P00"  // 或 "P0", "P1", "P2", null
}
```

**风灵方向示例**：
```json
{
  "priority": "P0"  // 或 "P1", "P2", null（无 P00）
}
```

---

## ✅ 验证清单

### 界面测试

**Next 方向**：
- [ ] 优先级筛选器显示 P00、P0、P1、P2、未设置
- [ ] 分类筛选器显示扁平的7个分类
- [ ] 上传表单显示单层分类选择器
- [ ] 优先级选择显示 P00、P0、P1、P2

**风灵方向**：
- [ ] 优先级筛选器显示 P0、P1、P2、未设置（无 P00）
- [ ] 分类筛选器显示所有子分类（TTS-xxx, ASR-xxx, VAD-xxx）
- [ ] 上传表单显示两层分类选择器（主分类 → 子分类）
- [ ] 优先级选择显示 P0、P1、P2（无 P00）

### 数据隔离测试

- [ ] 在 Next 方向创建 P00 优先级的 case
- [ ] 在风灵方向无法看到 P00 选项
- [ ] 在风灵方向创建 TTS 分类的 case
- [ ] 分类正确存储为 "TTS-xxx" 格式
- [ ] 两个方向的数据互不影响

---

## 📦 下一步工作

1. ✅ 创建配置文件（nextConfig.ts, fenglingConfig.ts, businessConfig.ts）
2. ✅ 修改 BadcaseListPage.tsx
3. ⏳ 修改 StatusFlowPage.tsx
4. ⏳ 修改 DataDashboardPage.tsx
5. ⏳ 修改 useStatistics.ts（统计逻辑）
6. ⏳ 更新数据库表结构（如果需要）
7. ⏳ 完整测试两个方向的所有功能

---

## 🚨 注意事项

1. **数据兼容性**：
   - 旧数据可能没有优先级字段，显示为"未设置"
   - Next 方向的旧数据分类格式不变
   - 风灵方向新数据分类格式为 "主分类-子分类"

2. **优先级验证**：
   - Next 方向可以使用 P00
   - 风灵方向不允许使用 P00（前端不显示该选项）

3. **分类存储**：
   - Next 方向：存储为 "读音错误"
   - 风灵方向：存储为 "TTS-读音错误"（带前缀）

4. **显示格式化**：
   - 使用 `getCategoryLabel()` 统一格式化分类显示
   - 使用 `getPriorityText()` 统一格式化优先级显示
