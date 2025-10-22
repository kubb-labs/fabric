import path from 'node:path'
import { File, createApp } from '@kubb/react-fabric'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { createParser, typescriptParser } from '@kubb/fabric-core/parsers'

const vueParser = createParser({
  name: 'vue',
  extNames: ['.vue'],
  install() {},
  parse(file, options) {
    return typescriptParser.parse(file, options)
  },
})

/**
 * Create a file and append JSX
 */
function App() {
  return (
    <File path={path.resolve(__dirname, 'gen/HelloWorld.vue')} baseName={'HelloWorld.vue'}>
      <File.Source>
        {`
      <script setup>
import { ref } from 'vue'

const msg = ref('Hello World!')
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg" />
</template>

        `}
      </File.Source>
    </File>
  )
}

async function start() {
  const app = createApp(App)

  app.render()
  app.use(fsPlugin)
  app.use(vueParser)
  await app.write()
}

start()
