# Calibration

Fixtures in `fixtures/` are rendered on a real emulator or simulator and by this library, and the frames of every
view are compared.

* `reference/<platform>-<pixel ratio>x/` holds the frames measured on the device, one file per fixture.
* `npm test` lays the fixtures out with the built library (`yarn build` in the repository root first) and writes the
  frames to `results/`.
* `npm run compare` prints the difference per fixture and exits with an error when a frame is off by more than
  0.01 (`THRESHOLD=0.5 npm run compare` to loosen it, `--verbose` to list the frames).

Fixtures marked `needsSystemFonts` only run when `system-fonts/android/` has `Roboto-Regular.ttf` and
`NotoSansCJK-Regular.ttc` pulled from the emulator with `adb pull /system/fonts/<file>`.

## Measuring on a device

1. `npm run collect` starts a server on port 4545 that writes what the app sends to `reference/`.
2. `npx expo start` and open the app in Expo Go (`exp://10.0.2.2:8081` on an Android emulator,
   `exp://localhost:8081` on an iOS simulator).
3. The app renders each fixture, reads every view's frame with `getBoundingClientRect()` and the text lines from
   `onTextLayout`, sends them and moves on to the next fixture until it shows "done".

Change the Android density with `adb shell wm density <dpi>` and reopen the app to measure another pixel ratio.
