import { createFabric } from '@kubb/fabric-core'
import { describe, expect, test } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { Class } from './Class.tsx'

describe('<Class/>', () => {
  test('should render a basic class', async () => {
    const Component = () => {
      return (
        <Class name="User">
          name: string
        </Class>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "class User {
        name: string
      }"
    `)
  })

  test('should render an exported class', async () => {
    const Component = () => {
      return (
        <Class name="User" export>
          constructor(public name: string) {'{}'}
        </Class>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "export class User {
        constructor(public name: string) {}
      }"
    `)
  })

  test('should render an abstract class', async () => {
    const Component = () => {
      return (
        <Class name="Animal" export abstract>
          abstract makeSound(): void
        </Class>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "export abstract class Animal {
        abstract makeSound(): void
      }"
    `)
  })

  test('should render with generics', async () => {
    const Component = () => {
      return (
        <Class name="Container" generics="T">
          constructor(public value: T) {'{}'}
        </Class>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "class Container<T> {
        constructor(public value: T) {}
      }"
    `)
  })

  test('should render with extends', async () => {
    const Component = () => {
      return (
        <Class name="Admin" extends="User">
          role: string
        </Class>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "class Admin extends User {
        role: string
      }"
    `)
  })

  test('should render with implements', async () => {
    const Component = () => {
      return (
        <Class name="Rectangle" implements="Shape">
          width: number{'\n'}
          height: number
        </Class>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "class Rectangle implements Shape {
        width: number
        height: number
      }"
    `)
  })

  test('should render with multiple implements', async () => {
    const Component = () => {
      return (
        <Class name="SmartDevice" implements={['Connectable', 'Updatable']}>
          connect(): void {'{}'}
        </Class>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "class SmartDevice implements Connectable, Updatable {
        connect(): void {}
      }"
    `)
  })

  test('should render with JSDoc', async () => {
    const Component = () => {
      return (
        <Class
          name="Logger"
          export
          JSDoc={{
            comments: ['A simple logging utility'],
          }}
        >
          log(message: string) {'{'}{'\n'}
          {'  '}console.log(message){'\n'}
          {'}'}
        </Class>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "/**
       * A simple logging utility
       */
      export class Logger {
        log(message: string) {
          console.log(message)
        }
      }"
    `)
  })

  test('should render complex class with all features', async () => {
    const Component = () => {
      return (
        <Class
          name="Repository"
          export
          abstract
          generics={['T', 'ID = string']}
          implements="IRepository"
          JSDoc={{
            comments: ['Abstract repository base class'],
          }}
        >
          abstract findById(id: ID): Promise{'<'}T | null{'>'}
        </Class>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "/**
       * Abstract repository base class
       */
      export abstract class Repository<T, ID = string> implements IRepository {
        abstract findById(id: ID): Promise<T | null>
      }"
    `)
  })
})
