import { createFabric } from '@kubb/react-fabric'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import { File, Interface, Class, Enum, Function, VarDeclaration } from '@kubb/react-fabric'

/**
 * Example demonstrating advanced TypeScript components
 * Interface, Class, and Enum components inspired by Alloy
 */

const fabric = createFabric()

// Generate types file with interfaces and enums
const TypesFile = () => {
  return (
    <File baseName="types.ts" path="./example10/gen/types.ts">
      <File.Source>
        <Enum name="UserRole" export>
          Admin = "admin",{'\n'}
          User = "user",{'\n'}
          Guest = "guest"
        </Enum>
      </File.Source>
      <File.Source>
        {'  '}
      </File.Source>
      <File.Source>
        <Interface
          name="User"
          export
          JSDoc={{
            comments: ['Represents a user in the system'],
          }}
        >
          id: number{'\n'}
          username: string{'\n'}
          email: string{'\n'}
          role: UserRole
        </Interface>
      </File.Source>
      <File.Source>
        {'  '}
      </File.Source>
      <File.Source>
        <Interface name="ApiResponse" export generics={['T']}>
          data: T{'\n'}
          status: number{'\n'}
          message?: string
        </Interface>
      </File.Source>
    </File>
  )
}

// Generate service class
const ServiceFile = () => {
  return (
    <File baseName="UserService.ts" path="./example10/gen/UserService.ts">
      <File.Source>
        <Class
          name="UserService"
          export
          JSDoc={{
            comments: ['Service for managing users'],
          }}
        >
          private users: User[] = []{'\n'}
          {'\n'}
          constructor(initialUsers: User[] = []) {'{'}{'\n'}
          {'  '}this.users = initialUsers{'\n'}
          {'}'}{'\n'}
          {'\n'}
          async getUser(id: number): Promise{'<'}User | null{'>'} {'{'}{'\n'}
          {'  '}return this.users.find(u ={'>'} u.id === id) || null{'\n'}
          {'}'}{'\n'}
          {'\n'}
          async createUser(user: User): Promise{'<'}User{'>'} {'{'}{'\n'}
          {'  '}this.users.push(user){'\n'}
          {'  '}return user{'\n'}
          {'}'}
        </Class>
      </File.Source>
    </File>
  )
}

// Generate utility functions
const UtilsFile = () => {
  return (
    <File baseName="utils.ts" path="./example10/gen/utils.ts">
      <File.Source>
        <VarDeclaration name="DEFAULT_TIMEOUT" export const type="number">
          5000
        </VarDeclaration>
      </File.Source>
      <File.Source>
        {'  '}
      </File.Source>
      <File.Source>
        <Function name="createApiResponse" export generics={['T']} params="data: T, status: number = 200" returnType="ApiResponse<T>">
          return {'{'}{'\n'}
          {'  '}data,{'\n'}
          {'  '}status,{'\n'}
          {'}'}
        </Function>
      </File.Source>
    </File>
  )
}

const App = () => {
  return (
    <>
      <TypesFile />
      <ServiceFile />
      <UtilsFile />
    </>
  )
}

fabric.use(fsPlugin, { clean: { path: './example10/gen' } })
fabric.use(typescriptParser)

fabric.render(App)
