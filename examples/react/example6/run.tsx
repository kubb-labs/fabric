import path from 'node:path'
import { File, createFabric } from '@kubb/react-fabric'
import { fsPlugin, reactPlugin } from '@kubb/react-fabric/plugins'
import { createParser, typescriptParser } from '@kubb/react-fabric/parsers'

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
  const fabric = createFabric()

  fabric.use(fsPlugin)
  fabric.use(reactPlugin)
  fabric.use(vueParser)

  fabric.render(App)

  await fabric.write()
}

start()
