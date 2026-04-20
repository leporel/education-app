<script setup lang="ts">
import { ref, computed } from 'vue'
import { NCard, NInput, NButton, NRadioGroup, NRadio, NSpace, NTag, NAlert } from 'naive-ui'
import { Check, X } from 'lucide-vue-next'
import type { Drill } from '@/api'
import { checkAnswer } from '@/lib/parse'

const props = defineProps<{ drill: Drill }>()
const emit = defineEmits<{ graded: [ok: boolean, drill: Drill] }>()

const input = ref('')
const choice = ref<string | null>(null)
const revealed = ref(false)
const ok = ref<boolean | null>(null)

const userAnswer = computed(() =>
  props.drill.type === 'multiple-choice' ? choice.value ?? '' : input.value,
)

function submit() {
  if (props.drill.check === 'manual') {
    revealed.value = true
    return
  }
  const result = checkAnswer(props.drill, userAnswer.value)
  ok.value = result
  revealed.value = true
  emit('graded', result, props.drill)
}

function selfGrade(v: boolean) {
  ok.value = v
  emit('graded', v, props.drill)
}

function reset() {
  input.value = ''
  choice.value = null
  revealed.value = false
  ok.value = null
}
</script>

<template>
  <NCard size="small" class="drill">
    <template #header>
      <NSpace align="center" size="small">
        <NTag size="small" :type="drill.type === 'multiple-choice' ? 'info' : 'default'">
          {{ drill.type }}
        </NTag>
        <span style="opacity: 0.7; font-size: 13px">{{ drill.check }}</span>
      </NSpace>
    </template>
    <div class="prompt">{{ drill.prompt }}</div>

    <div v-if="drill.type === 'multiple-choice'" class="options">
      <NRadioGroup v-model:value="choice" :disabled="revealed">
        <NSpace vertical>
          <NRadio v-for="opt in drill.options" :key="opt" :value="opt">{{ opt }}</NRadio>
        </NSpace>
      </NRadioGroup>
    </div>
    <NInput
      v-else
      v-model:value="input"
      type="text"
      :disabled="revealed"
      placeholder="Твой ответ..."
      @keyup.enter="submit"
    />

    <div v-if="drill.hint && !revealed" class="hint">подсказка: {{ drill.hint }}</div>

    <NSpace style="margin-top: 10px" align="center">
      <NButton v-if="!revealed" type="primary" size="small" @click="submit">Проверить</NButton>
      <NButton v-else size="small" @click="reset">Ещё раз</NButton>
    </NSpace>

    <NAlert
      v-if="revealed && drill.check !== 'manual'"
      :type="ok ? 'success' : 'error'"
      style="margin-top: 10px"
      :show-icon="false"
    >
      <template v-if="ok">
        <Check :size="14" style="vertical-align: -2px" /> Верно
      </template>
      <template v-else>
        <X :size="14" style="vertical-align: -2px" /> Ответ: <b>{{ drill.answer }}</b>
      </template>
    </NAlert>
    <NAlert v-if="revealed && drill.check === 'manual'" type="info" style="margin-top: 10px" :show-icon="false">
      Эталон: <b>{{ drill.answer }}</b>
      <NSpace style="margin-top: 8px">
        <NButton size="tiny" type="success" @click="selfGrade(true)">Справился</NButton>
        <NButton size="tiny" type="error" @click="selfGrade(false)">Не справился</NButton>
      </NSpace>
    </NAlert>
  </NCard>
</template>

<style scoped>
.drill {
  margin: 12px 0;
  max-width: 640px;
}
.prompt {
  margin-bottom: 10px;
  font-size: 15px;
}
.hint {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.6;
}
.options {
  margin-top: 6px;
}
</style>
