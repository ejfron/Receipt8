<script setup lang="ts">
import { computed } from 'vue'
import { languages } from '../generators'
import { docs } from '../docs'

const props = defineProps<{ lang: string }>()

const language = computed(() => languages.find((l) => l.id === props.lang))
const doc = computed(() => (language.value ? docs[language.value.id] : null))

const others = computed(() => languages.filter((l) => l.id !== props.lang))
</script>

<template>
  <main class="page">
    <div v-if="!language || !doc" class="prose">
      <h1>No docs for “{{ lang }}”</h1>
      <p>That is not a language Receipt8 generates. Try one of these:</p>
      <p class="chips">
        <RouterLink v-for="l in languages" :key="l.id" class="chip" :to="`/docs/${l.id}`">{{ l.label }}</RouterLink>
      </p>
      <p class="back"><RouterLink to="/docs">← All documentation</RouterLink></p>
    </div>

    <div v-else class="prose">
      <p class="eyebrow"><RouterLink to="/docs">Documentation</RouterLink> / {{ language.label }}</p>
      <h1>{{ language.label }}</h1>
      <p class="lede">{{ doc.summary }}</p>

      <dl class="facts">
        <div>
          <dt>Library</dt>
          <dd>{{ language.library }}</dd>
        </div>
        <div>
          <dt>Runtime</dt>
          <dd>{{ doc.runtime }}</dd>
        </div>
        <div>
          <dt>Install</dt>
          <dd><code>{{ doc.install }}</code></dd>
        </div>
      </dl>

      <h2 class="h-rule">Connection setting</h2>
      <p>The Connection dropdown in the header changes which transport the generated file opens.</p>
      <ul class="plain">
        <li v-for="c in doc.connections" :key="c.label"><strong>{{ c.label }}</strong> — {{ c.detail }}</li>
      </ul>

      <section v-for="s in doc.sections" :key="s.heading">
        <h2 class="h-rule">{{ s.heading }}</h2>
        <p v-for="(p, i) in s.body" :key="i">{{ p }}</p>
        <figure v-if="s.code" class="snippet">
          <figcaption v-if="s.codeCaption">{{ s.codeCaption }}</figcaption>
          <pre><code>{{ s.code }}</code></pre>
        </figure>
      </section>

      <h2 class="h-rule">When it goes wrong</h2>
      <ul class="plain gotchas">
        <li v-for="g in doc.gotchas" :key="g.title">
          <strong>{{ g.title }}</strong>
          <span>{{ g.body }}</span>
        </li>
      </ul>

      <h2 class="h-rule">Reference</h2>
      <ul class="plain">
        <li v-for="l in doc.links" :key="l.href">
          <a :href="l.href" target="_blank" rel="noopener noreferrer">{{ l.label }} ↗</a>
        </li>
      </ul>

      <h2 class="h-rule">Other languages</h2>
      <p class="chips">
        <RouterLink v-for="o in others" :key="o.id" class="chip" :to="`/docs/${o.id}`">{{ o.label }}</RouterLink>
      </p>

      <p class="back"><RouterLink to="/">← Back to the workbench</RouterLink></p>
    </div>
  </main>
</template>
