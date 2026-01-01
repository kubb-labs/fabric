import { createFabric, createRefKey } from '@kubb/react-fabric'
import { refKeyPlugin } from '@kubb/fabric-core/plugins'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import { File, VarDeclaration, Function } from '@kubb/react-fabric'

/**
 * Example demonstrating VarDeclaration component with RefKey support
 * Inspired by Alloy's approach to ergonomic code generation
 */

const fabric = createFabric()

// Enable refKey plugin for automatic import management
fabric.use(refKeyPlugin)

// Create refkeys for cross-file references
const greetingRef = createRefKey('GREETING')
const userTypeRef = createRefKey('User')

// Generate constants.ts with a greeting constant
const ConstantsFile = () => {
  return (
    <File baseName="constants.ts" path="./example9/gen/constants.ts">
      <File.Source>
        <VarDeclaration name="GREETING" export refkey={greetingRef}>
          "Hello from Kubb Fabric!"
        </VarDeclaration>
      </File.Source>
    </File>
  )
}

// Generate types.ts with a User type
const TypesFile = () => {
  return (
    <File baseName="types.ts" path="./example9/gen/types.ts">
      <File.Source isTypeOnly isExportable name="User">
        {`export type User = {
  id: number
  name: string
  email: string
}`}
      </File.Source>
    </File>
  )
}

// Generate utils.ts that uses the constants and types
const UtilsFile = () => {
  return (
    <File baseName="utils.ts" path="./example9/gen/utils.ts">
      <File.Source>
        <Function name="greetUser" export params="user: User" returnType="string">
          return `${'{'}GREETING{'}'} ${'{'}{user.name}{'}'}!`
        </Function>
      </File.Source>
      <File.Source>
        <VarDeclaration name="DEFAULT_USER" export type="User">
          {`{
  id: 1,
  name: 'Guest',
  email: 'guest@example.com'
}`}
        </VarDeclaration>
      </File.Source>
    </File>
  )
}

const App = () => {
  return (
    <>
      <ConstantsFile />
      <TypesFile />
      <UtilsFile />
    </>
  )
}

fabric.use(fsPlugin, { clean: { path: './example9/gen' } })
fabric.use(typescriptParser)

fabric.render(App)
