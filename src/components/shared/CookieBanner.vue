<script setup lang="ts">
import { X } from 'lucide-vue-next'

const emit = defineEmits(['dismiss'])
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 z-50 bg-gray-50 border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
      <p class="text-[13px] text-gray-500">
        We use cookies and similar technologies to help personalize content, tailor and measure ads, and provide a safer experience.
        By clicking accept, you agree to our
        <a href="#" class="text-indigo-600 underline">privacy policy</a>.
      </p>
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="emit('dismiss')"
          class="bg-indigo-500 text-white text-[13px] font-medium px-4 py-1.5 rounded-lg border-none cursor-pointer hover:bg-indigo-600 transition-colors whitespace-nowrap"
        >
          Accept
        </button>
        <button
          @click="emit('dismiss')"
          class="text-gray-400 bg-none border-none cursor-pointer p-1 hover:text-gray-600 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
