<template>
  <div class="field--row"><slot /></div>
</template>

<style scoped>
.field--row { display: grid; gap: var(--tm-sys-space-4); grid-template-columns: 1fr; }
@media (min-width: 620px) { .field--row { grid-template-columns: repeat(2, 1fr); } }
</style>
