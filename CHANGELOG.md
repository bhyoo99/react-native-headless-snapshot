### Master

* Replace the native `yoga-layout` 1.9 with `yoga-layout` 3 (WebAssembly, bundled into the build), so installing no longer compiles C++
* Remove `font-manager`: fonts other than the bundled Proza Libre must be loaded with `loadFont` or `addFontToSvg`
* Move the test setup to Jest 30, Babel 8 and TypeScript 6
* Accept the output of React 19 renderers: `@testing-library/react-native`, `test-renderer` and `react-test-renderer`, including trees with several roots

### 0.1.0

* Adds the ability to set a default font [dawnmist]
* Improved text position rendering [jacobp100]

### 0.0.24

* Fix style property number `0` not set - [jhen0409]

### 0.0.22 - 0.0.23

* Add support for `EDGE_ALL` of margin / padding / borderWidth  - [jhen0409]

### 0.0.21

* fixes for jest 21.x - [orta]

### 0.0.20 

Initial working version

  - Handles a lot of flexbox
  - Handles text layouts inside the SVGs
