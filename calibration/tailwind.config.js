module.exports = {
  content: ["./App.tsx", "./fixtures/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        arimo: ["Arimo-Regular"],
        "arimo-bold": ["Arimo-Bold"],
        noto: ["NotoSansKR-Regular"],
      },
    },
  },
}
