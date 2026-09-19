<script setup lang="ts">
import WorkbenchBar from '../components/layout/WorkbenchBar.vue'
import EditorPanel from '../components/editor/EditorPanel.vue'
import ReceiptPaper from '../components/preview/ReceiptPaper.vue'
import CodePanel from '../components/code/CodePanel.vue'
</script>

<template>
  <WorkbenchBar />
  <main class="workbench">
    <EditorPanel />
    <ReceiptPaper />
    <CodePanel />
  </main>
</template>
