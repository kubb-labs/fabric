import { createFabric } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { code, createContext, stc, useContext } from '@kubb/stc-fabric'

// Example 1: Basic stc component
function HelloWorld(props: { name: string }) {
  return code`
    // Generated greeting
    const greeting = "Hello, ${props.name}!";
  `
}

const HelloWorldStc = stc(HelloWorld)

// Example 2: Using context for configuration
const ConfigContext = createContext({ 
  prefix: 'generated',
  suffix: 'Impl'
})

function ClassGenerator(props: { name: string; methods: string[] }) {
  const config = useContext(ConfigContext)
  const className = `${config.prefix}${props.name}${config.suffix}`
  
  const methodsCode = props.methods
    .map(method => `  ${method}() {\n    // TODO: implement\n  }`)
    .join('\n\n')

  return code`
export class ${className} {
${methodsCode}
}
  `
}

const ClassGeneratorStc = stc(ClassGenerator)

// Example 3: Composing multiple components (no async/await needed!)
function generateCode() {
  const greeting = HelloWorldStc({ name: 'World' })
  
  const userClass = ClassGeneratorStc({ 
    name: 'User',
    methods: ['getName', 'setName', 'getAge', 'setAge']
  })

  return code`
${greeting}

${userClass}
  `
}

// Use with Fabric
export async function run() {
  const fabric = createFabric()
  
  fabric.use(fsPlugin)
  fabric.use(typescriptParser)
  
  const generatedCode = generateCode()
  
  await fabric.addFile({
    baseName: 'generated.ts',
    path: './example-stc/gen/generated.ts',
    sources: [
      {
        value: generatedCode,
        isExportable: false,
        isIndexable: false,
      },
    ],
    imports: [],
    exports: [],
  })

  await fabric.write()
  
  console.log('✅ Generated code using stc components!')
}

run()
