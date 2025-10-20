<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog as="div" class="relative z-[9999]" @close="$emit('update:modelValue', false)">
      <!-- 背景遮罩 -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50" />
      </TransitionChild>

      <!-- Dialog 容器 -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-[560px] transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
              <!-- Header -->
              <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <DialogTitle as="h3" class="text-xl font-semibold text-gray-900 dark:text-white">
                  Fee
                </DialogTitle>
                <button
                  @click="$emit('update:modelValue', false)"
                  class="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="关闭"
                >
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Body -->
              <div class="px-6 py-4">
    <div class="fee-modal-content">
      <!-- Chain Options with Fee Types -->
      <div class="chain-sections">
        <!-- BTC Section -->
        <div
          class="chain-section  main-border "
          :class="{ faded: selectedChain !== 'btc', selected: selectedChain === 'btc' }"
        >
          <div class="chain-header flex items-center" @click="selectChain('btc')">
            <div class="chain-icon">
              <img src="@/assets/images/btc.png" alt="BTC" class="w-[30px] h-[30px] rounded-full" />
            </div>
            <div class="chain-info">
              <div class="chain-name">BTC</div>
              <div class="chain-subtitle">Network</div>
            </div>
          </div>

          <div class="fee-options">
            <div
              class="fee-option "
              :class="{
                selected: selectedBTCFeeType === 'economyFee',
                disabled: selectedChain !== 'btc',
              }"
              @click="selectFeeType('economyFee', 'btc')"
            >
              <div class="fee-label">ECO</div>
              <div class="flex items-center gap-1">
                <div class="fee-value">{{ chainStore.state.btc.economyFee }}</div>
                <div class="fee-time">sat/vB</div>
              </div>
            </div>

            <div
              class="fee-option "
              :class="{
                selected: selectedBTCFeeType === 'halfHourFee',
                disabled: selectedChain !== 'btc',
              }"
              @click="selectFeeType('halfHourFee', 'btc')"
            >
              <div class="fee-label">Normal</div>
              <div class="flex items-center gap-1">
                <div class="fee-value">{{ chainStore.state.btc.halfHourFee }}</div>
                <div class="fee-time">sat/vB</div>
              </div>
            </div>

            <div
              class="fee-option "
              :class="{
                selected: selectedBTCFeeType === 'customizeFee',
                disabled: selectedChain !== 'btc',
              }"
              @click="selectFeeType('customizeFee', 'btc')"
            >
              <div class="fee-label">Customize</div>
              <div class="flex items-center gap-1">
              
                <input
                  v-if="selectedChain === 'btc' && selectedBTCFeeType === 'customizeFee'"
                  v-model="customBTCValue"
                  type="number"
                  class="fee-input"
                  placeholder="Custom fee"
                  @click.stop
                  :min="0.3"
                />
                <div v-else class="fee-value">{{ chainStore.state.btc.customizeFee }}</div>
                <div class="fee-time">sat/vB</div>
              </div>
            </div>
          </div>
        </div>

        <!-- MVC Section -->
        <div
          class="chain-section main-border"
          :class="{ faded: selectedChain !== 'mvc', selected: selectedChain === 'mvc' }"
        >
          <div class="chain-header " @click="selectChain('mvc')">
            <div class="chain-icon">
              <img src="@/assets/images/mvc.png" alt="MVC" class="w-[30px] h-[30px] rounded-full" />
            </div>
            <div class="flex flex-col gap-1">
              <div class="chain-info">
                <div class="chain-name">MVC</div>
                <div class="chain-subtitle">Network</div>
              </div>
              <div class=" rounded-full bg-[#F7931A]/20 text-[#F7931A] text-xs px-2 py-0">
                Bitcoin sidechain
              </div>
            </div>
          </div>

          <div class="fee-options">
            <div
              class="fee-option "
              :class="{
                selected: selectedMVCFeeType === 'economyFee',
                disabled: selectedChain !== 'mvc',
              }"
              @click="selectFeeType('economyFee', 'mvc')"
            >
              <div class="fee-label">ECO</div>
              <div class="flex items-center gap-1">
                <div class="fee-value">{{ chainStore.state.mvc.economyFee }}</div>
                <div class="fee-time">sat/vB</div>
              </div>
            </div>

            <div
              class="fee-option "
              :class="{
                selected: selectedMVCFeeType === 'fastestFee',
                disabled: selectedChain !== 'mvc',
              }"
              @click="selectFeeType('fastestFee', 'mvc')"
            >
              <div class="fee-label">High</div>
              <div class="flex items-center gap-1">
                <div class="fee-value">{{ chainStore.state.mvc.fastestFee }}</div>
                <div class="fee-time">sat/vB</div>
              </div>
            </div>

            <div
              class="fee-option"
              :class="{
                selected: selectedMVCFeeType === 'customizeFee',
                disabled: selectedChain !== 'mvc',
              }"
              @click="selectFeeType('customizeFee', 'mvc')"
            >
              <div class="fee-label">Customize</div>
              <div class="flex items-center gap-1">
                <input
                  v-if="selectedChain === 'mvc' && selectedMVCFeeType === 'customizeFee'"
                  v-model="customMVCValue"
                  type="number"
                  class="fee-input"
                  placeholder="Custom fee"
                  @click.stop
                />
                <div v-else class="fee-value">{{ chainStore.state.mvc.customizeFee }}</div>
                <div class="fee-time">sat/vB</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- OK Button -->
      <button class="ok-button main-border primary " @click="handleConfirm">
        OK
      </button>
    </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { toast } from '@/utils/toast'
import { useChainStore, type ChainFeeData } from '@/stores/chain'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const chainStore = useChainStore()

// Reactive states
const selectedChain = ref<'btc' | 'mvc'>('btc')
const selectedBTCFeeType = ref<ChainFeeData['selectedFeeType']>(chainStore.state.btc.selectedFeeType)
const selectedMVCFeeType = ref<ChainFeeData['selectedFeeType']>(chainStore.state.mvc.selectedFeeType)

const customBTCValue = ref<number>(chainStore.state.btc.customizeFee)
const customMVCValue = ref<number>(chainStore.state.mvc.customizeFee)



// Methods
const selectChain = (chain: 'btc' | 'mvc') => {
  selectedChain.value = chain
}

const selectFeeType = (feeType: ChainFeeData['selectedFeeType'], chain:'btc'|'mvc') => {
  selectedChain.value = chain
  if (chain === 'btc') {
    selectedBTCFeeType.value = feeType
  } else {
    selectedMVCFeeType.value = feeType
  }
}

const handleConfirm = () => {
  // Update the store with selected values
  chainStore.setCurrentChain(selectedChain.value)
  if (selectedChain.value === 'btc') {
    chainStore.setBtcFeeType(selectedBTCFeeType.value)
    if (selectedBTCFeeType.value === 'customizeFee') {
      if(customBTCValue.value < 1){
       toast.error('BTC custom fee must be at least 1 sat/vB')
       customBTCValue.value=1
      }
      chainStore.setBtcCustomizeFee(customBTCValue.value)
    }
    chainStore.setBtcFeeType(selectedBTCFeeType.value)
  } else {
    chainStore.setMvcFeeType(selectedMVCFeeType.value)
    if (selectedMVCFeeType.value === 'customizeFee') {
      chainStore.setMvcCustomizeFee(customMVCValue.value)
    }
  }


  emit('update:modelValue', false)
}

// Initialize with current store values
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      // Initialize with current store state
      selectedChain.value = chainStore.state.currentChain
      if (selectedChain.value === 'btc') {
        selectedBTCFeeType.value = chainStore.state.btc.selectedFeeType
        customBTCValue.value = chainStore.state.btc.customizeFee
      } else {
        selectedMVCFeeType.value = chainStore.state.mvc.selectedFeeType
        customMVCValue.value = chainStore.state.mvc.customizeFee
      }
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.fee-modal-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chain-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chain-section {
  border-radius: 12px;
  overflow: hidden;


}

.chain-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.15s ease;

  &.selected {
    border-color: var(--color-primary);
    background: rgba(var(--color-primaryRgb), 0.1);
  }

  &:hover {
    border-color: var(--color-primary);
    transform: translateY(-1px);
  }
}

.chain-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chain-info {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 8px;
  .chain-name {
    font-weight: 500;
    font-size: 18px;
    color: var(--themeTextColor);
  }
  .chain-subtitle {
    font-size: 14px;
    color: var(--themeFadedTextColor);
  }
}

.mvc-badge {
  background: var(--color-primary);
  color: var(--themeTextColor);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  display: inline-block;
}

.fee-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 4px;
  padding: 0 20px 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.fee-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 9px;
  cursor: pointer;
  border-radius: 8px;
  background: var(--themeBgThreeColor);
  transition: all 0.15s ease;

  //   &.selected {
  //     border: 2px solid var(--themeTextColor);
  //     background: var(--color-primary);
  //   }
}
.chain-section {
  &.selected {
    .fee-option {
      &.selected {
        border: 2px solid var(--themeTextColor);
        background: var(--color-primary);
           .fee-label {
            color: #fff;
          }
          .fee-value {
            color: #fff;
          }
          .fee-time {
            color: #fff;
          }
      }
    }
  }
}
.dark {
  .chain-section {
    &.selected {
      .fee-option {
        &.selected {
          border: 2px solid #000;
          background: var(--color-primary);
          .fee-label {
            color: #000;
          }
          .fee-value {
            color: #000;
          }
          .fee-time {
            color: #000;
          }
        }
      }
    }
  }
}
.fee-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--themeTextColor);
}

.fee-value {
  font-size: 18px;
  color: var(--themeTextColor);
}

.fee-time {
  font-size: 14px;
  color: var(--themeFadedTextColor);
  opacity: 0.8;
}

.fee-input {
  background: var(--themeBgSecondColor);
  border: 1px solid var(--faded-border-color);
  border-radius: 4px;
  padding: 0px 8px;
  font-size: 18px;
  color: var(--themeTextColor);
  width: 50px;
  text-align: center;

  &::placeholder {
    color: var(--themeFadedTextColor);
    font-size: 10px;
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
}
.ok-button {
  display: block;
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
  color:#fff; //var(--themeTextColor);
  border: none;
  transition: all 0.15s ease;
}

// ElDialog specific styles
:deep(.el-dialog) {
  border-radius: 12px;

  .el-dialog__header {
    padding: 20px 20px 0;

    .el-dialog__title {
      font-size: 20px;
      font-weight: 600;
      color: var(--themeTextColor);
    }
  }

  .el-dialog__body {
    padding: 0 20px 20px;
  }
}
</style>
