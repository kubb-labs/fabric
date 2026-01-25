# @kubb/react-fabric

## 0.12.5

### Patch Changes

- [`33c9a76`](https://github.com/kubb-labs/fabric/commit/33c9a764f74483c4da5984440550ceb2d89ce857) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - export Root

- Updated dependencies []:
  - @kubb/fabric-core@0.12.5

## 0.12.4

### Patch Changes

- [`5267c48`](https://github.com/kubb-labs/fabric/commit/5267c48cff8d1e15e864cf2ac9042d7808bb54a0) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Expose fabric

- Updated dependencies []:
  - @kubb/fabric-core@0.12.4

## 0.12.3

### Patch Changes

- Updated dependencies [[`9dce22e`](https://github.com/kubb-labs/fabric/commit/9dce22e9aa5bb2a708eb2d925697a377cb1780ca)]:
  - @kubb/fabric-core@0.12.3

## 0.12.2

### Patch Changes

- Updated dependencies [[`2f7cd1c`](https://github.com/kubb-labs/fabric/commit/2f7cd1cffa11ad17e6c210694c6f47cdb1a6546b)]:
  - @kubb/fabric-core@0.12.2

## 0.12.1

### Patch Changes

- [#148](https://github.com/kubb-labs/fabric/pull/148) [`c347279`](https://github.com/kubb-labs/fabric/commit/c347279f7a05dcf9333daf5c0c898c229a5b51c6) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Update package builder tsdown

- Updated dependencies [[`c347279`](https://github.com/kubb-labs/fabric/commit/c347279f7a05dcf9333daf5c0c898c229a5b51c6)]:
  - @kubb/fabric-core@0.12.1

## 0.12.0

### Minor Changes

- [#145](https://github.com/kubb-labs/fabric/pull/145) [`ae7a4a3`](https://github.com/kubb-labs/fabric/commit/ae7a4a3ede64d2c0f09e737cf4157a1ebc161672) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Refactor indentation system with custom implementation using intrinsic elements. This change removes the external `dedent` dependency and introduces a new indentation mechanism using `<indent>`, `<dedent>`, and `<br>` intrinsic elements along with a `RenderContext` to track and apply indentation during code generation. The new approach provides more precise control over indentation and improves performance by eliminating third-party dependencies.

### Patch Changes

- Updated dependencies [[`ae7a4a3`](https://github.com/kubb-labs/fabric/commit/ae7a4a3ede64d2c0f09e737cf4157a1ebc161672)]:
  - @kubb/fabric-core@0.12.0

## 0.11.8

### Patch Changes

- Make sure we can render functional non react components

- Updated dependencies []:
  - @kubb/fabric-core@0.11.8

## 0.11.7

### Patch Changes

- [`b19041c`](https://github.com/kubb-labs/fabric/commit/b19041c5addbf40c289afb34edc890681aaa6332) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Default check for react-devtools-core package

- Updated dependencies []:
  - @kubb/fabric-core@0.11.7

## 0.11.6

### Patch Changes

- [#131](https://github.com/kubb-labs/fabric/pull/131) [`118ef3f`](https://github.com/kubb-labs/fabric/commit/118ef3f856fb98bd8e419301362b0f683b6f7488) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Fix React DevTools setup

- Updated dependencies [[`118ef3f`](https://github.com/kubb-labs/fabric/commit/118ef3f856fb98bd8e419301362b0f683b6f7488)]:
  - @kubb/fabric-core@0.11.6

## 0.11.5

### Patch Changes

- [#127](https://github.com/kubb-labs/fabric/pull/127) [`f48fc56`](https://github.com/kubb-labs/fabric/commit/f48fc565ef7529e2ac12e9b26f3b2fb47c9ed998) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Fix React DevTools stuck at "Loading React element tree" by ensuring renderer injection happens after react-devtools-core is imported but before connectToDevTools() is called

- Updated dependencies []:
  - @kubb/fabric-core@0.11.5

## 0.11.4

### Patch Changes

- [#125](https://github.com/kubb-labs/fabric/pull/125) [`9110c73`](https://github.com/kubb-labs/fabric/commit/9110c73a2c44cd9d9be4dcb6bd6c1a334b9196ec) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Fix React DevTools integration by setting up globals before import and properly destructuring functions

- Updated dependencies []:
  - @kubb/fabric-core@0.11.4

## 0.11.3

### Patch Changes

- [`ebfe4c3`](https://github.com/kubb-labs/fabric/commit/ebfe4c370333a4e6ae807486fbd87e64091ef650) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Use of KubbNode

- Updated dependencies []:
  - @kubb/fabric-core@0.11.3

## 0.11.2

### Patch Changes

- [`62cdbf8`](https://github.com/kubb-labs/fabric/commit/62cdbf838140bcc5fd28dea3b8b304bc98c2a9a8) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - revert custom KubbElement

- Updated dependencies []:
  - @kubb/fabric-core@0.11.2

## 0.11.1

### Patch Changes

- [`e75992c`](https://github.com/kubb-labs/fabric/commit/e75992cda3b955a25f9956aaedf8b1a2bca23c77) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - correct exports

- Updated dependencies []:
  - @kubb/fabric-core@0.11.1

## 0.11.0

### Minor Changes

- [`a84b6b0`](https://github.com/kubb-labs/fabric/commit/a84b6b0d166a0be1c4dabcb86afb07eb90131565) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - FSX first release

### Patch Changes

- Updated dependencies [[`a84b6b0`](https://github.com/kubb-labs/fabric/commit/a84b6b0d166a0be1c4dabcb86afb07eb90131565)]:
  - @kubb/fabric-core@0.11.0

## 0.10.0

### Minor Changes

- [#104](https://github.com/kubb-labs/fabric/pull/104) [`000e087`](https://github.com/kubb-labs/fabric/commit/000e087044f9737fa3cef7904ef26fd2fddd5077) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Use of Fabric core composables with custom Context helpers (Vue inspired).

### Patch Changes

- Updated dependencies [[`000e087`](https://github.com/kubb-labs/fabric/commit/000e087044f9737fa3cef7904ef26fd2fddd5077)]:
  - @kubb/fabric-core@0.10.0

## 0.9.5

### Patch Changes

- [#102](https://github.com/kubb-labs/fabric/pull/102) [`b5c8743`](https://github.com/kubb-labs/fabric/commit/b5c874321348ef9874e25cef97addcca96ad9981) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Fix parameter ordering in generated functions to follow TypeScript conventions: required → optional → default

  The `order()` function in `getFunctionParams.ts` was incorrectly placing parameters with default values before optional parameters, which violates TypeScript's parameter ordering rules. This fix ensures generated function signatures place optional parameters before those with defaults.

- Updated dependencies []:
  - @kubb/fabric-core@0.9.5

## 0.9.4

### Patch Changes

- [#100](https://github.com/kubb-labs/fabric/pull/100) [`670a4f5`](https://github.com/kubb-labs/fabric/commit/670a4f53e8fefdb81c69d55366ee2dc9d8079c13) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Treat children with default values as optional when determining parent optionality in FunctionParams. When all children have either `optional: true` or a default value, the parent parameter now gets `= {}` appended, making it fully optional.

- Updated dependencies []:
  - @kubb/fabric-core@0.9.4

## 0.9.3

### Patch Changes

- [#96](https://github.com/kubb-labs/fabric/pull/96) [`2ba4327`](https://github.com/kubb-labs/fabric/commit/2ba4327ea93c3657d6bef8b5da5fb565b9f32dfa) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Fix FunctionParams.toConstructor() to render optional object-mode parameters with valid TypeScript syntax

- Updated dependencies []:
  - @kubb/fabric-core@0.9.3

## 0.9.2

### Patch Changes

- [`4f238c7`](https://github.com/kubb-labs/fabric/commit/4f238c79518cedeb46e9b5da5d6c138a40f91fc5) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Do not repeat console.error but use console.log

- Updated dependencies []:
  - @kubb/fabric-core@0.9.2

## 0.9.1

### Patch Changes

- [`fb407bf`](https://github.com/kubb-labs/fabric/commit/fb407bf8cbd915fc18054407e75990e4bc636c63) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Better throw of errors

- Updated dependencies [[`fb407bf`](https://github.com/kubb-labs/fabric/commit/fb407bf8cbd915fc18054407e75990e4bc636c63)]:
  - @kubb/fabric-core@0.9.1

## 0.9.0

### Patch Changes

- Updated dependencies [[`bf1f368`](https://github.com/kubb-labs/fabric/commit/bf1f36863554b07b87a04dc676b6bd5d12a86280)]:
  - @kubb/fabric-core@0.9.0

## 0.8.0

### Patch Changes

- Updated dependencies [[`349fb76`](https://github.com/kubb-labs/fabric/commit/349fb76eb5eccf9ef7d4f366f441859c475089bc)]:
  - @kubb/fabric-core@0.8.0

## 0.7.4

### Patch Changes

- [`be4a479`](https://github.com/kubb-labs/fabric/commit/be4a47992b54824e40e638f7c72b34f46a8afcd8) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Revert previous change for callback

- Updated dependencies [[`be4a479`](https://github.com/kubb-labs/fabric/commit/be4a47992b54824e40e638f7c72b34f46a8afcd8)]:
  - @kubb/fabric-core@0.7.4

## 0.7.3

### Patch Changes

- [#33](https://github.com/kubb-labs/fabric/pull/33) [`03dc56c`](https://github.com/kubb-labs/fabric/commit/03dc56c42b606bcd34f9dc053912c52f46ac5497) Thanks [@blackravenx](https://github.com/blackravenx)! - add support for callback type in getFunctionParams utility

- Updated dependencies []:
  - @kubb/fabric-core@0.7.3

## 0.7.2

### Patch Changes

- [#71](https://github.com/kubb-labs/fabric/pull/71) [`59b8150`](https://github.com/kubb-labs/fabric/commit/59b81501feb921ca9c9fb04b405ae42910d8d029) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Improve test coverage for existing features

  Added comprehensive test coverage for previously untested or under-tested components:
  - Added tests for tsxParser, AsyncEventEmitter, dom utilities, open utility, fsPlugin, graphPlugin, and getFunctionParams
  - Overall statement coverage improved from 78.98% to 83.52%
  - Overall branch coverage improved from 75.33% to 80.02%
  - Overall function coverage improved from 69.34% to 74.45%
  - Added 42 new test cases across 7 files

- Updated dependencies [[`59b8150`](https://github.com/kubb-labs/fabric/commit/59b81501feb921ca9c9fb04b405ae42910d8d029)]:
  - @kubb/fabric-core@0.7.2

## 0.7.1

### Patch Changes

- [#69](https://github.com/kubb-labs/fabric/pull/69) [`410a227`](https://github.com/kubb-labs/fabric/commit/410a2276a6986bbbb138c8fd24eaeb89bfb7a9bc) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Update tsdown

- Updated dependencies [[`410a227`](https://github.com/kubb-labs/fabric/commit/410a2276a6986bbbb138c8fd24eaeb89bfb7a9bc)]:
  - @kubb/fabric-core@0.7.1

## 0.7.0

### Patch Changes

- Updated dependencies [[`771df79`](https://github.com/kubb-labs/fabric/commit/771df79913095ce41ef1fd9ec3d05227bc4b2371)]:
  - @kubb/fabric-core@0.7.0

## 0.6.0

### Patch Changes

- Updated dependencies [[`5e4c2bf`](https://github.com/kubb-labs/fabric/commit/5e4c2bf73666b14af736bcf553f1bbf63c99564a)]:
  - @kubb/fabric-core@0.6.0

## 0.5.5

### Patch Changes

- [#60](https://github.com/kubb-labs/fabric/pull/60) [`06345d0`](https://github.com/kubb-labs/fabric/commit/06345d0bdfa83dca69c1ddc49414b46e0f60b306) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Correct use of define and create

- Updated dependencies [[`06345d0`](https://github.com/kubb-labs/fabric/commit/06345d0bdfa83dca69c1ddc49414b46e0f60b306)]:
  - @kubb/fabric-core@0.5.5

## 0.5.4

### Patch Changes

- [`35ac47c`](https://github.com/kubb-labs/fabric/commit/35ac47c8528b2ecca8fbe91d592261072903ead6) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Update packages

- Updated dependencies [[`35ac47c`](https://github.com/kubb-labs/fabric/commit/35ac47c8528b2ecca8fbe91d592261072903ead6)]:
  - @kubb/fabric-core@0.5.4

## 0.5.3

### Patch Changes

- [`377eedf`](https://github.com/kubb-labs/fabric/commit/377eedfb03a9377a8ef633774284ba6027c7c8ee) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Reduce duplicated sourceNames

- Updated dependencies [[`377eedf`](https://github.com/kubb-labs/fabric/commit/377eedfb03a9377a8ef633774284ba6027c7c8ee)]:
  - @kubb/fabric-core@0.5.3

## 0.5.2

### Patch Changes

- Updated dependencies [[`3e9c031`](https://github.com/kubb-labs/fabric/commit/3e9c031e8424f80dd65b3784ed4a294e3be17eaf)]:
  - @kubb/fabric-core@0.5.2

## 0.5.1

### Patch Changes

- [`13c91bb`](https://github.com/kubb-labs/fabric/commit/13c91bb41e76b94d463a67c6870f04cfbe6b77aa) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Correct export with default import of react

- Updated dependencies []:
  - @kubb/fabric-core@0.5.1

## 0.5.0

### Minor Changes

- [#47](https://github.com/kubb-labs/fabric/pull/47) [`e51dd0e`](https://github.com/kubb-labs/fabric/commit/e51dd0e46c00b58191d988ae55d5d152289e6134) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Update loggerPlugin to support progressbar and websockets

### Patch Changes

- Updated dependencies [[`e51dd0e`](https://github.com/kubb-labs/fabric/commit/e51dd0e46c00b58191d988ae55d5d152289e6134)]:
  - @kubb/fabric-core@0.5.0

## 0.4.1

### Patch Changes

- [#52](https://github.com/kubb-labs/fabric/pull/52) [`5e1de31`](https://github.com/kubb-labs/fabric/commit/5e1de310d2a52a0f4404a8f450f07afc19087bb0) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Include React as part of react-fabric

- Updated dependencies []:
  - @kubb/fabric-core@0.4.1

## 0.4.0

### Minor Changes

- [#49](https://github.com/kubb-labs/fabric/pull/49) [`8967dd5`](https://github.com/kubb-labs/fabric/commit/8967dd5fb5edbaf95d02cb3ad7dab7fd0c24c84f) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - react bundeld

### Patch Changes

- Updated dependencies []:
  - @kubb/fabric-core@0.4.0

## 0.3.1

### Patch Changes

- Updated dependencies [[`4780364`](https://github.com/kubb-labs/fabric/commit/478036455e4f305bd2f95ec4bed9e1a7df734595)]:
  - @kubb/fabric-core@0.3.1

## 0.3.0

### Minor Changes

- [#44](https://github.com/kubb-labs/fabric/pull/44) [`6c50def`](https://github.com/kubb-labs/fabric/commit/6c50def6757c43b3ab0b5806410b8ed305a0022c) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Performance updates

### Patch Changes

- Updated dependencies [[`6c50def`](https://github.com/kubb-labs/fabric/commit/6c50def6757c43b3ab0b5806410b8ed305a0022c)]:
  - @kubb/fabric-core@0.3.0

## 0.2.19

### Patch Changes

- Updated dependencies [[`96840a9`](https://github.com/kubb-labs/fabric/commit/96840a96a6fd9388f60d26711cd9d54cb8c1a63d)]:
  - @kubb/fabric-core@0.2.19

## 0.2.18

### Patch Changes

- Updated dependencies [[`5356373`](https://github.com/kubb-labs/fabric/commit/535637325ee50b30be35263122af9f89289bf233)]:
  - @kubb/fabric-core@0.2.18

## 0.2.17

### Patch Changes

- [#36](https://github.com/kubb-labs/fabric/pull/36) [`63206b1`](https://github.com/kubb-labs/fabric/commit/63206b127ba12b44dcdd20e5534829d52d6f1cef) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - resolveName and resolvePath

- Updated dependencies [[`63206b1`](https://github.com/kubb-labs/fabric/commit/63206b127ba12b44dcdd20e5534829d52d6f1cef)]:
  - @kubb/fabric-core@0.2.17

## 0.2.16

### Patch Changes

- Updated dependencies [[`3013418`](https://github.com/kubb-labs/fabric/commit/3013418835f87e3f7597bce5e0ee07f4b4e40129)]:
  - @kubb/fabric-core@0.2.16

## 0.2.15

### Patch Changes

- [`739f776`](https://github.com/kubb-labs/fabric/commit/739f77656263855d2331877a4fdcaa87fefec086) Thanks [@stijnvanhullem](https://github.com/stijnvanhullem)! - Better use of ctx in `install`

- Updated dependencies [[`739f776`](https://github.com/kubb-labs/fabric/commit/739f77656263855d2331877a4fdcaa87fefec086)]:
  - @kubb/fabric-core@0.2.15

## 0.2.14

### Patch Changes

- [`866e5e3`](https://github.com/kubb-labs/fabric/commit/866e5e3c6aa4143fee0a288500edfd6649da6f7a) Thanks [@stijnvanhullem](https://github.com/stijnvanhullem)! - update types to not use fabric react in fabric react

- Updated dependencies [[`866e5e3`](https://github.com/kubb-labs/fabric/commit/866e5e3c6aa4143fee0a288500edfd6649da6f7a)]:
  - @kubb/fabric-core@0.2.14

## 0.2.13

### Patch Changes

- Updated dependencies [[`b1ada8b`](https://github.com/kubb-labs/fabric/commit/b1ada8b0900bbda74bbb180b2f0fbf4085dace52)]:
  - @kubb/fabric-core@0.2.13

## 0.2.12

### Patch Changes

- [`37575f8`](https://github.com/kubb-labs/fabric/commit/37575f814a43f0e729aa6870d4f3760710eb2d97) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Use of config

- Updated dependencies [[`37575f8`](https://github.com/kubb-labs/fabric/commit/37575f814a43f0e729aa6870d4f3760710eb2d97)]:
  - @kubb/fabric-core@0.2.12

## 0.2.11

### Patch Changes

- [`a9fe1b7`](https://github.com/kubb-labs/fabric/commit/a9fe1b7e6a76b3eae1fe4fa15dfca62b81be8eeb) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Expose Fragment

- Updated dependencies []:
  - @kubb/fabric-core@0.2.11

## 0.2.10

### Patch Changes

- [`f79b76b`](https://github.com/kubb-labs/fabric/commit/f79b76bf5daf5f259e4d3c8a53bca64e926206fa) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - update reamd

- Updated dependencies [[`f79b76b`](https://github.com/kubb-labs/fabric/commit/f79b76bf5daf5f259e4d3c8a53bca64e926206fa)]:
  - @kubb/fabric-core@0.2.10

## 0.2.9

### Patch Changes

- [`38aaaa6`](https://github.com/kubb-labs/fabric/commit/38aaaa66518a40fb36d89ee798a9f8b58774668b) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - add size checker

- Updated dependencies [[`38aaaa6`](https://github.com/kubb-labs/fabric/commit/38aaaa66518a40fb36d89ee798a9f8b58774668b)]:
  - @kubb/fabric-core@0.2.9

## 0.2.8

### Patch Changes

- [`f32ca33`](https://github.com/kubb-labs/fabric/commit/f32ca33f8c48011336f99c43b12869b7b0cf8cd3) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - better imports

- Updated dependencies [[`f32ca33`](https://github.com/kubb-labs/fabric/commit/f32ca33f8c48011336f99c43b12869b7b0cf8cd3)]:
  - @kubb/fabric-core@0.2.8

## 0.2.7

### Patch Changes

- [`39e7228`](https://github.com/kubb-labs/fabric/commit/39e7228249ff9e67f24b6f30486b56185a2e52cd) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Do not add globals

- Updated dependencies []:
  - @kubb/fabric-core@0.2.7

## 0.2.6

### Patch Changes

- [`ad1571d`](https://github.com/kubb-labs/fabric/commit/ad1571d5eeaaa82cb936650823786d2c5d280a8e) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Add types of react as dependency

- Updated dependencies []:
  - @kubb/fabric-core@0.2.6

## 0.2.5

### Patch Changes

- [`a234cd3`](https://github.com/kubb-labs/fabric/commit/a234cd3232dd9e8f7e4d8956d964d4b3fe25af69) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - add more jsx types

- Updated dependencies []:
  - @kubb/fabric-core@0.2.5

## 0.2.4

### Patch Changes

- [`b6952e8`](https://github.com/kubb-labs/fabric/commit/b6952e896ff802dde3e3b6a984a7a36260b4a4a3) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Do not use React bundeld

- Updated dependencies []:
  - @kubb/fabric-core@0.2.4

## 0.2.3

### Patch Changes

- [`be05a65`](https://github.com/kubb-labs/fabric/commit/be05a65f8bfa2b50ebaa2d560871949b6b8b81d6) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Fabric export

- Updated dependencies [[`be05a65`](https://github.com/kubb-labs/fabric/commit/be05a65f8bfa2b50ebaa2d560871949b6b8b81d6)]:
  - @kubb/fabric-core@0.2.3

## 0.2.2

### Patch Changes

- [`a111976`](https://github.com/kubb-labs/fabric/commit/a1119766913ce8c4a4da7a1a380355e77defe7a8) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Import devtools after open

- Updated dependencies []:
  - @kubb/fabric-core@0.2.2

## 0.2.1

### Patch Changes

- [`7969e4c`](https://github.com/kubb-labs/fabric/commit/7969e4ca0d8d50bd900cb5f1534d45d83a4a619a) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - rename app to fabric

- Updated dependencies [[`7969e4c`](https://github.com/kubb-labs/fabric/commit/7969e4ca0d8d50bd900cb5f1534d45d83a4a619a)]:
  - @kubb/fabric-core@0.2.1

## 0.2.0

### Minor Changes

- [`9a01dfd`](https://github.com/kubb-labs/fabric/commit/9a01dfd5f8941ec1d26832526f3c24460c496a48) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Prepare v0.1.0

### Patch Changes

- Updated dependencies [[`9a01dfd`](https://github.com/kubb-labs/fabric/commit/9a01dfd5f8941ec1d26832526f3c24460c496a48)]:
  - @kubb/fabric-core@0.2.0

## 0.1.8

### Patch Changes

- Updated dependencies [[`71622a1`](https://github.com/kubb-labs/fabric/commit/71622a1986169a73b7f10d83941ffb03f81490ef)]:
  - @kubb/fabric-core@0.1.8

## 0.1.7

### Patch Changes

- Updated dependencies [[`5c125c8`](https://github.com/kubb-labs/fabric/commit/5c125c8a5301616fb1aa8f7a38d93f7d55ff1849)]:
  - @kubb/fabric-core@0.1.7

## 0.1.6

### Patch Changes

- [#12](https://github.com/kubb-labs/fabric/pull/12) [`ead05cc`](https://github.com/kubb-labs/fabric/commit/ead05cc1d1a57bec1d72d4159f6fcb54371bfd0c) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Support for barrelPlugin to create barrel files

- Updated dependencies [[`ead05cc`](https://github.com/kubb-labs/fabric/commit/ead05cc1d1a57bec1d72d4159f6fcb54371bfd0c), [`67295d8`](https://github.com/kubb-labs/fabric/commit/67295d8c210d768d1e4307c1c7a683ebe978f145), [`ead05cc`](https://github.com/kubb-labs/fabric/commit/ead05cc1d1a57bec1d72d4159f6fcb54371bfd0c)]:
  - @kubb/fabric-core@0.1.6

## 0.1.5

### Patch Changes

- [`c7f32d4`](https://github.com/kubb-labs/fabric/commit/c7f32d470ae88c0667356c4f788d3292ad5f5410) Thanks [@stijnvanhullem](https://github.com/stijnvanhullem)! - Correct use declare global with Kubb.App interface

- Updated dependencies [[`c7f32d4`](https://github.com/kubb-labs/fabric/commit/c7f32d470ae88c0667356c4f788d3292ad5f5410)]:
  - @kubb/fabric-core@0.1.5

## 0.1.4

### Patch Changes

- [`2434a5a`](https://github.com/kubb-labs/fabric/commit/2434a5a1aff83672d51efab6d9598b02b5dbe635) Thanks [@stijnvanhullem](https://github.com/stijnvanhullem)! - No defaultParsers + reactPlugin to use React as compiler

- Updated dependencies [[`2434a5a`](https://github.com/kubb-labs/fabric/commit/2434a5a1aff83672d51efab6d9598b02b5dbe635)]:
  - @kubb/fabric-core@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies [[`502cb7a`](https://github.com/kubb-labs/fabric/commit/502cb7a2d28074c2433ec3add94a07bcee86a4de)]:
  - @kubb/fabric-core@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [[`a1d95ae`](https://github.com/kubb-labs/fabric/commit/a1d95ae26ffb3ea77e389509a8fae75d1ff1ddb4)]:
  - @kubb/fabric-core@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [[`f4f16be`](https://github.com/kubb-labs/fabric/commit/f4f16be0486133cdfb69cfa724b98c8523eb8f83)]:
  - @kubb/fabric-core@0.1.1

## 0.1.0

### Patch Changes

- Updated dependencies [[`e4f8313`](https://github.com/kubb-labs/fabric/commit/e4f8313e652044df9a5f7404221d26f5333884e2)]:
  - @kubb/fabric-core@0.1.0

## 0.0.1

### Patch Changes

- [`1145527`](https://github.com/kubb-labs/fabric/commit/1145527323c10e9a066de8ec9fd79ca439963d3b) Thanks [@stijnvanhulle](https://github.com/stijnvanhulle)! - Add test cases for Fabric core and React

- Updated dependencies [[`1145527`](https://github.com/kubb-labs/fabric/commit/1145527323c10e9a066de8ec9fd79ca439963d3b)]:
  - @kubb/fabric-core@0.0.1
