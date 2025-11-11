import { createApp, type Component } from 'vue'
import App from './App.vue'
import { UAlert, UBadge, UButton, UCard, UContainer } from '@nuxt/ui'
import '@unocss/reset/tailwind.css'
import '@nuxt/ui/dist/ui.css'
import './style.css'

const app = createApp(App)

const components: Record<string, Component> = {
  UAlert,
  UBadge,
  UButton,
  UCard,
  UContainer,
}

for (const [name, component] of Object.entries(components)) {
  app.component(name, component)
}

app.mount('#app')
