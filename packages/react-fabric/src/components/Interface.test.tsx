import { createFabric, createRefKey } from '@kubb/fabric-core'
import { describe, expect, test } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { Interface } from './Interface.tsx'

describe('<Interface/>', () => {
  test('should render a basic interface', async () => {
    const Component = () => {
      return (
        <Interface name="User">
          id: number{'\n'}
          name: string
        </Interface>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "interface User {
        id: number
        name: string
      }"
    `)
  })

  test('should render an exported interface', async () => {
    const Component = () => {
      return (
        <Interface name="User" export>
          id: number{'\n'}
          name: string
        </Interface>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "export interface User {
        id: number
        name: string
      }"
    `)
  })

  test('should render with generics', async () => {
    const Component = () => {
      return (
        <Interface name="Response" generics="T">
          data: T{'\n'}
          status: number
        </Interface>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "interface Response<T> {
        data: T
        status: number
      }"
    `)
  })

  test('should render with multiple generics', async () => {
    const Component = () => {
      return (
        <Interface name="Result" generics={['T', 'E = Error']}>
          data?: T{'\n'}
          error?: E
        </Interface>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "interface Result<T, E = Error> {
        data?: T
        error?: E
      }"
    `)
  })

  test('should render with extends clause', async () => {
    const Component = () => {
      return (
        <Interface name="Admin" extends="User">
          role: string
        </Interface>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "interface Admin extends User {
        role: string
      }"
    `)
  })

  test('should render with multiple extends', async () => {
    const Component = () => {
      return (
        <Interface name="SuperUser" extends={['User', 'Timestamped']}>
          permissions: string[]
        </Interface>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "interface SuperUser extends User, Timestamped {
        permissions: string[]
      }"
    `)
  })

  test('should render with JSDoc comments', async () => {
    const Component = () => {
      return (
        <Interface
          name="User"
          export
          JSDoc={{
            comments: ['Represents a user in the system', '@see UserService'],
          }}
        >
          id: number{'\n'}
          name: string
        </Interface>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "/**
       * Represents a user in the system
       * @see UserService
       */
      export interface User {
        id: number
        name: string
      }"
    `)
  })

  test('should work with refkey (syntax only)', async () => {
    const refkey = createRefKey()

    const Component = () => {
      return (
        <Interface name="Config" export refkey={refkey}>
          port: number{'\n'}
          host: string
        </Interface>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "export interface Config {
        port: number
        host: string
      }"
    `)
  })

  test('should render complex interface with all features', async () => {
    const Component = () => {
      return (
        <Interface
          name="ApiResponse"
          export
          generics={['T', 'E = ApiError']}
          JSDoc={{
            comments: ['Generic API response wrapper'],
          }}
        >
          data?: T{'\n'}
          error?: E{'\n'}
          status: number{'\n'}
          message: string
        </Interface>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "/**
       * Generic API response wrapper
       */
      export interface ApiResponse<T, E = ApiError> {
        data?: T
        error?: E
        status: number
        message: string
      }"
    `)
  })
})
