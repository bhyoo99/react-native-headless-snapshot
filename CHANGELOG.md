### Master

* Replace the native `yoga-layout` 1.9 with `yoga-layout` 3 (WebAssembly, bundled into the build), so installing no longer compiles C++
* Remove `font-manager`: fonts other than the bundled Proza Libre must be loaded with `loadFont` or `addFontToSvg`
* Move the test setup to Jest 30, Babel 8 and TypeScript 6
* Accept the output of React 19 renderers: `@testing-library/react-native`, `test-renderer` and `react-test-renderer`, including trees with several roots
* Update `fontkit` to 3 and `linebreak` to 2 (both ESM-only) and bundle them into the build, so the package has no runtime dependencies
* Replace TSLint with ESLint and typescript-eslint, update husky and lint-staged, and drop Travis CI and Danger
* Run lint, type-check, tests and build on GitHub Actions (Node 22 and 24)
* Fix `alignItems`/`alignSelf: "flex-start"`, which laid views out at the end
* Fix font weight matching: SemiBold and ExtraBold faces no longer replace Bold, and bold/italic text now gets its `@font-face`
* Only add `@font-face` rules for fonts used by the snapshot being rendered
* Escape `<`, `>` and `&` in text and attributes (numeric character references such as `&#xF101;` are kept)
* Default the line height to the font's natural line height instead of 18
* Replace every character that is invalid in file names when naming SVG snapshots
* Follow Jest's snapshot rules: write missing snapshots and pass (not with `--ci`), fail with a diff without overwriting on a mismatch, and overwrite only with `-u`
* Build the package in `prepare`, so it can be installed straight from GitHub with npm and Yarn
* Add `platform` and `scale` options and `layoutTree()`: views use React Native's Yoga settings on the device pixel grid, and `platform: "android"` measures text like React Native on Android
* Add `loadSystemFont()` and `loadFallbackFont()` for text without a `fontFamily` and for glyphs missing from a font
* Measure text like React Native on iOS with `platform: "ios"`: TextKit line heights, kerning, letter spacing on every character, the system font's optical size and `trak` tracking, character-level Hangul line breaks, and text sizes rounded up to the pixel grid
* Fallback fonts loaded with `loadFallbackFont()` are grouped by family and matched by weight
* Add the `calibration` folder: fixtures, measurements from an Android emulator at 2x, 2.625x, 3x and 3.5x, and a check that runs in CI
* Lay out `gap`/`rowGap`/`columnGap`, `flexWrap`, `alignContent`, `aspectRatio` (number or `"16 / 9"`), `display` (views with `none` are left out of the SVG), `space-evenly`, `position: static`, `overflow`, `direction`, `boxSizing`, and `Start`/`End`/`Block`/`Inline`/`inset` edges

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
