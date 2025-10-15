# SCSS 样式说明

## 使用 SCSS 变量

在任何 Vue 组件中导入和使用 SCSS 变量：

```vue
<style scoped lang="scss">
@import './styles/variables.scss';

.my-component {
  color: $primary-color;
  padding: $spacing-md;
  border-radius: $border-radius-lg;
}
</style>
```

## 使用 Mixins

```vue
<style scoped lang="scss">
@import './styles/variables.scss';

.centered-card {
  @include card;
  @include flex-center;
}

.primary-button {
  @include button-base;
  background-color: $primary-color;
  color: white;
}
</style>
```

## 响应式设计

```vue
<style scoped lang="scss">
@import './styles/variables.scss';

.container {
  padding: $spacing-sm;
  
  @include responsive(md) {
    padding: $spacing-lg;
  }
  
  @include responsive(lg) {
    padding: $spacing-xl;
  }
}
</style>
```

## 结合 Tailwind CSS

SCSS 可以与 Tailwind CSS 配合使用：

```vue
<style scoped lang="scss">
@import './styles/variables.scss';

.custom-card {
  // 使用 Tailwind 的 @apply
  @apply bg-white rounded-lg shadow-md;
  
  // 结合 SCSS 变量
  padding: $spacing-lg;
  
  &:hover {
    box-shadow: $shadow-lg;
  }
}
</style>
```

