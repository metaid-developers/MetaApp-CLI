<template>
  <div class="upload-file-container">
    <!-- 上传区域 -->
    <div 
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'uploading': isUploading }"
      @click="triggerFileInput"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div class="upload-content">
        <div class="upload-icon" v-if="!isUploading">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <!-- 上传动画 -->
        <div class="upload-animation" v-if="isUploading">
          <div class="spinner"></div>
        </div>
        
        <div class="upload-text">
          <h3 v-if="!isUploading">点击选择文件或拖拽文件到此处</h3>
          <h3 v-else>正在处理文件...</h3>
          <p class="file-types">支持图片、视频、PDF、ZIP等格式</p>
          <p class="file-limit" v-if="maxSize">最大文件大小: {{ formatFileSize(maxSize) }}</p>
        </div>
      </div>
      
      <input
        ref="fileInput"
        type="file"
        multiple
        :accept="acceptedTypes"
        @change="handleFileSelect"
        style="display: none;"
      />
    </div>

    <!-- 文件列表 -->
    <div class="file-list" v-if="selectedFiles.length > 0">
      <h4>已选择的文件 ({{ selectedFiles.length }})</h4>
      <div class="files-grid">
        <div 
          v-for="(file, index) in selectedFiles" 
          :key="index"
          class="file-item"
        >
          <div class="file-preview">
            <!-- 图片预览 -->
            <img 
              v-if="file.type.startsWith('image/')" 
              :src="file.preview" 
              :alt="file.name"
              class="preview-image"
            />
            <!-- 视频预览 -->
            <video 
              v-else-if="file.type.startsWith('video/')"
              :src="file.preview"
              class="preview-video"
              muted
            >
            </video>
            <!-- 其他文件类型图标 -->
            <div v-else class="file-icon">
              <svg v-if="file.type === 'application/pdf'" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
                <path d="M16 13H8" stroke="currentColor" stroke-width="2"/>
                <path d="M16 17H8" stroke="currentColor" stroke-width="2"/>
                <path d="M10 9H9H8" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.toLowerCase().endsWith('.zip') || file.name.toLowerCase().endsWith('.rar')" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8C21 6.9 20.1 6 19 6H14L12 4H5C3.9 4 3 4.9 3 6V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V16Z" stroke="currentColor" stroke-width="2"/>
                <path d="M8 10H16" stroke="currentColor" stroke-width="2"/>
                <path d="M8 14H16" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
          </div>
          
          <div class="file-info">
            <div class="file-name" :title="file.name">{{ file.name }}</div>
            <div class="file-size">{{ formatFileSize(file.size) }}</div>
            <div class="file-type">{{ file.type || '未知类型' }}</div>
          </div>
          
          <button 
            class="delete-btn"
            @click="removeFile(index)"
            title="删除文件"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6M19 6V20C19 20.55 18.55 21 18 21H6C5.45 21 5 20.55 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="file-actions">
        <button class="clear-all-btn" @click="clearAllFiles" v-if="selectedFiles.length > 0">
          清空所有文件
        </button>
        <button class="add-more-btn" @click="triggerFileInput">
          添加更多文件
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 定义接口
interface FileItem {
  file: File
  name: string
  size: number
  type: string
  preview?: string
}

// Props
interface Props {
  maxFiles?: number
  maxSize?: number // 字节
  acceptedTypes?: string
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxFiles: 10,
  maxSize: 100 * 1024 * 1024, // 100MB
  acceptedTypes: 'image/*,video/*,application/pdf,application/zip,application/x-zip-compressed,.zip,.rar',
  multiple: true
})

// Emits
const emit = defineEmits<{
  'files-selected': [files: FileItem[]]
  'files-removed': [files: FileItem[]]
}>()

// 响应式数据
const selectedFiles = ref<FileItem[]>([])
const isDragOver = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement>()

// 文件类型检查函数已移除，直接在模板中进行类型检查

// 文件大小格式化
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 创建文件预览
const createFilePreview = async (file: File): Promise<string | undefined> => {
  return new Promise((resolve) => {
    // 直接检查文件的MIME类型
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => resolve(undefined)
      reader.readAsDataURL(file)
    } else if (file.type.startsWith('video/')) {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => resolve(undefined)
      reader.readAsDataURL(file)
    } else {
      resolve(undefined)
    }
  })
}

// 验证文件
const validateFile = (file: File): string | null => {
  // 检查文件大小
  if (file.size > props.maxSize) {
    return `文件 "${file.name}" 超过最大大小限制 (${formatFileSize(props.maxSize)})`
  }
  
  // 检查文件数量
  if (selectedFiles.value.length >= props.maxFiles) {
    return `最多只能选择 ${props.maxFiles} 个文件`
  }
  
  return null
}

// 处理文件选择
const processFiles = async (files: FileList) => {
  isUploading.value = true
  
  try {
    const newFiles: FileItem[] = []
    
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // 验证文件
      const error = validateFile(file)
      if (error) {
        console.warn(error)
        continue
      }
      
      // 创建文件项
      const fileItem: FileItem = {
        file,
        name: file.name,
        size: file.size,
        type: file.type
      }
      
      // 创建预览
      const preview = await createFilePreview(file)
      if (preview) {
        fileItem.preview = preview
      }
      
      newFiles.push(fileItem)
    }
    
    // 添加到已选文件列表
    selectedFiles.value.push(...newFiles)
    
    // 触发事件
    emit('files-selected', newFiles)
    
  } finally {
    isUploading.value = false
  }
}

// 触发文件输入
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    processFiles(target.files)
    // 清空input值，允许重复选择相同文件
    target.value = ''
  }
}

// 拖拽处理
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  if (event.dataTransfer?.files) {
    processFiles(event.dataTransfer.files)
  }
}

// 删除文件
const removeFile = (index: number) => {
  const removedFile = selectedFiles.value[index]
  selectedFiles.value.splice(index, 1)
  emit('files-removed', [removedFile])
}

// 清空所有文件
const clearAllFiles = () => {
  const removedFiles = [...selectedFiles.value]
  selectedFiles.value = []
  emit('files-removed', removedFiles)
}

// 暴露方法给父组件
defineExpose({
  clearFiles: clearAllFiles,
  getFiles: () => selectedFiles.value,
  addFiles: processFiles
})
</script>

<style scoped>
.upload-file-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background: #dbeafe;
  transform: scale(1.02);
}

.upload-area.uploading {
  border-color: #10b981;
  background: #ecfdf5;
  cursor: not-allowed;
}

.upload-content {
  position: relative;
  z-index: 1;
}

.upload-icon {
  color: #6b7280;
  margin-bottom: 16px;
  transition: color 0.3s ease;
}

.upload-area:hover .upload-icon {
  color: #3b82f6;
}

.upload-animation {
  margin-bottom: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.upload-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.file-types {
  color: #6b7280;
  font-size: 14px;
  margin: 4px 0;
}

.file-limit {
  color: #9ca3af;
  font-size: 12px;
  margin: 4px 0 0 0;
}

.file-list {
  margin-top: 24px;
}

.file-list h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.file-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: white;
  transition: all 0.2s ease;
  position: relative;
}

.file-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.file-preview {
  width: 100%;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.preview-image,
.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  color: #6b7280;
}

.file-info {
  margin-bottom: 8px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.file-size,
.file-type {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
}

.file-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.file-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.clear-all-btn,
.add-more-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
}

.clear-all-btn {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

.clear-all-btn:hover {
  background: #fecaca;
}

.add-more-btn {
  background: #dbeafe;
  color: #2563eb;
  border-color: #bfdbfe;
}

.add-more-btn:hover {
  background: #bfdbfe;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .files-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .upload-area {
    padding: 24px 16px;
  }
  
  .upload-text h3 {
    font-size: 16px;
  }
  
  .file-actions {
    flex-direction: column;
  }
}
</style>
