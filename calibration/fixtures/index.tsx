import type { ReactElement } from "react"
import { ActivityIndicator, FlatList, Image, ScrollView, Switch, TextInput, View } from "react-native"

import { Text } from "../primitives"

export interface Fixture {
  name: string
  width: number
  height: number
  needsSystemFonts?: boolean
  render: () => ReactElement
}

const box = (backgroundColor: string, style = {}) => <View style={{ backgroundColor, ...style }} />

const lorem = "The quick brown fox jumps over the lazy dog while the band keeps playing a slow song"

export const fixtures: Fixture[] = [
  {
    name: "views-fractional",
    width: 360,
    height: 400,
    render: () => (
      <View style={{ flex: 1, padding: 10.3, backgroundColor: "#eeeeee" }}>
        {box("tomato", { height: 33.3, margin: 7.7 })}
        <View style={{ flexDirection: "row", gap: 5.5, padding: 3.3 }}>
          {box("skyblue", { flex: 1, height: 20.2 })}
          {box("steelblue", { flex: 1, height: 20.2 })}
          {box("navy", { flex: 1, height: 20.2 })}
        </View>
        {box("seagreen", { width: "33.3%", aspectRatio: 1.7, marginLeft: "12.5%" })}
      </View>
    ),
  },
  {
    name: "views-row-thirds",
    width: 101,
    height: 60,
    render: () => (
      <View style={{ flex: 1, flexDirection: "row" }}>
        {box("tomato", { flex: 1 })}
        {box("skyblue", { flex: 1 })}
        {box("navy", { flex: 1 })}
      </View>
    ),
  },
  {
    name: "views-absolute",
    width: 300,
    height: 300,
    render: () => (
      <View style={{ flex: 1, padding: 15.5 }}>
        {box("tomato", { position: "absolute", left: "10%", right: "23.3%", top: 12.25, height: 40 })}
        {box("skyblue", { position: "absolute", right: 7.5, bottom: "15%", width: 66.6, height: 33.3 })}
        {box("navy", { position: "absolute", top: "50%", left: "50%", width: 21, height: 21, marginLeft: -10.5 })}
      </View>
    ),
  },
  {
    name: "views-wrap",
    width: 320,
    height: 260,
    render: () => (
      <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", alignContent: "space-between", gap: 9.5, padding: 6.25 }}>
        {Array.from({ length: 9 }, (_, i) => (
          <View key={i} style={{ backgroundColor: i % 2 ? "skyblue" : "steelblue", width: 70.7, height: 41.3 }} />
        ))}
      </View>
    ),
  },
  {
    name: "views-borders",
    width: 300,
    height: 200,
    render: () => (
      <View style={{ flex: 1, padding: 8, gap: 6 }}>
        {box("white", { borderWidth: 1.5, borderColor: "black", padding: 5.5, height: 50 })}
        <View style={{ borderWidth: 0.5, borderColor: "black", borderLeftWidth: 3.25, padding: 4 }}>
          {box("tomato", { height: 21.7 })}
        </View>
      </View>
    ),
  },
  {
    name: "text-single",
    width: 360,
    height: 120,
    render: () => (
      <View style={{ flex: 1, padding: 16, alignItems: "flex-start" }}>
        <Text style={{ fontFamily: "Arimo-Regular", fontSize: 14 }}>Hello world</Text>
        <Text style={{ fontFamily: "Arimo-Bold", fontSize: 17 }}>Bold headline</Text>
      </View>
    ),
  },
  {
    name: "text-wrap",
    width: 240,
    height: 300,
    render: () => (
      <View style={{ flex: 1, padding: 12 }}>
        <Text style={{ fontFamily: "Arimo-Regular", fontSize: 15 }}>{lorem}</Text>
      </View>
    ),
  },
  {
    name: "text-sizes",
    width: 360,
    height: 260,
    render: () => (
      <View style={{ flex: 1, padding: 10, alignItems: "flex-start", gap: 4 }}>
        {[11, 13.5, 16, 22, 34].map(size => (
          <Text key={size} style={{ fontFamily: "Arimo-Regular", fontSize: size }}>Size {size}</Text>
        ))}
      </View>
    ),
  },
  {
    name: "text-line-height",
    width: 220,
    height: 300,
    render: () => (
      <View style={{ flex: 1, padding: 10, gap: 12 }}>
        <Text style={{ fontFamily: "Arimo-Regular", fontSize: 14, lineHeight: 24 }}>{lorem}</Text>
        <Text style={{ fontFamily: "Arimo-Regular", fontSize: 18, lineHeight: 18 }}>{lorem}</Text>
      </View>
    ),
  },
  {
    name: "text-letter-spacing",
    width: 360,
    height: 160,
    render: () => (
      <View style={{ flex: 1, padding: 10, alignItems: "flex-start", gap: 6 }}>
        <Text style={{ fontFamily: "Arimo-Regular", fontSize: 14, letterSpacing: 0.5 }}>Letter spacing</Text>
        <Text style={{ fontFamily: "Arimo-Regular", fontSize: 14, letterSpacing: -0.3 }}>Letter spacing</Text>
        <Text style={{ fontFamily: "Arimo-Bold", fontSize: 12, letterSpacing: 1.2 }}>ALL</Text>
      </View>
    ),
  },
  {
    name: "text-nested",
    width: 260,
    height: 200,
    render: () => (
      <View style={{ flex: 1, padding: 10 }}>
        <Text style={{ fontFamily: "Arimo-Regular", fontSize: 14 }}>
          Plain text with <Text style={{ fontFamily: "Arimo-Bold" }}>bold words</Text> and a
          <Text style={{ fontSize: 20 }}> bigger part</Text> that wraps onto more lines
        </Text>
      </View>
    ),
  },
  {
    name: "text-centered-wrap",
    width: 200,
    height: 160,
    render: () => (
      <View style={{ flex: 1, alignItems: "center", padding: 10 }}>
        <Text style={{ fontFamily: "Arimo-Regular", fontSize: 15, textAlign: "center" }}>A centered title that wraps</Text>
      </View>
    ),
  },
  {
    name: "text-chips",
    width: 360,
    height: 120,
    render: () => (
      <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 16 }}>
        {["ALL", "News", "Events", "Q&A"].map(label => (
          <View key={label} style={{ paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 16 }}>
            <Text style={{ fontFamily: "Arimo-Bold", fontSize: 14, letterSpacing: 0.4 }}>{label}</Text>
          </View>
        ))}
      </View>
    ),
  },
  {
    name: "text-single-chip-column",
    width: 360,
    height: 80,
    render: () => (
      <View style={{ flex: 1, flexDirection: "row", paddingLeft: 16 }}>
        <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 16 }}>
          <Text style={{ fontFamily: "Arimo-Bold", fontSize: 14, letterSpacing: 0.4 }}>ALL</Text>
        </View>
      </View>
    ),
  },
  {
    name: "text-number-of-lines",
    width: 220,
    height: 160,
    render: () => (
      <View style={{ flex: 1, padding: 10 }}>
        <Text numberOfLines={2} style={{ fontFamily: "Arimo-Regular", fontSize: 15 }}>{lorem}</Text>
      </View>
    ),
  },
  {
    name: "text-system-font",
    needsSystemFonts: true,
    width: 300,
    height: 200,
    render: () => (
      <View style={{ flex: 1, padding: 10, alignItems: "flex-start", gap: 6 }}>
        <Text style={{ fontSize: 14 }}>System font text</Text>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>System bold</Text>
        <Text style={{ fontSize: 15 }}>안녕하세요 한글 시스템 폰트 줄바꿈 확인용 문장입니다</Text>
      </View>
    ),
  },
  {
    name: "text-advance-probe",
    width: 360,
    height: 1400,
    render: () => (
      <View style={{ flex: 1, padding: 4, alignItems: "flex-start" }}>
        {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 26, 28, 32].map(size => (
          <Text key={size} style={{ fontFamily: "Arimo-Regular", fontSize: size }}>
            {"Hello world\nThe quick brown fox\nLetter spacing"}
          </Text>
        ))}
      </View>
    ),
  },
  {
    name: "text-font-probe",
    needsSystemFonts: true,
    width: 360,
    height: 2400,
    render: () => (
      <View style={{ flex: 1, padding: 4, alignItems: "flex-start" }}>
        {[11, 13, 14, 15, 16, 17, 19, 22].flatMap(size => [
          <Text key={`system-${size}`} style={{ fontSize: size }}>{"Hello world\nThe quick brown fox\n안녕하세요 반갑습니다"}</Text>,
          <Text key={`system-500-${size}`} style={{ fontSize: size, fontWeight: "500" }}>{"Hello world\n안녕하세요 반갑습니다"}</Text>,
          <Text key={`system-bold-${size}`} style={{ fontSize: size, fontWeight: "bold" }}>{"Hello world\n안녕하세요 반갑습니다"}</Text>,
          <Text key={`noto-${size}`} style={{ fontFamily: "NotoSansKR-Regular", fontSize: size }}>{"Hello world\n안녕하세요 반갑습니다"}</Text>,
          <Text key={`noto-bold-${size}`} style={{ fontFamily: "NotoSansKR-Bold", fontSize: size }}>{"Hello world\n안녕하세요 반갑습니다"}</Text>,
        ])}
      </View>
    ),
  },
  {
    name: "text-korean-wrap",
    needsSystemFonts: true,
    width: 180,
    height: 500,
    render: () => (
      <View style={{ flex: 1, padding: 10, gap: 10 }}>
        <Text style={{ fontFamily: "NotoSansKR-Regular", fontSize: 15 }}>
          한글 줄바꿈은 단어 단위인지 글자 단위인지 확인하는 아주아주긴단어가들어있는 문장입니다
        </Text>
        <Text style={{ fontSize: 15 }}>
          한글 줄바꿈은 단어 단위인지 글자 단위인지 확인하는 아주아주긴단어가들어있는 문장입니다
        </Text>
        <Text style={{ fontFamily: "NotoSansKR-Regular", fontSize: 14, lineHeight: 22 }}>
          English words mixed 한글 단어 together 섞인 문장이 어떻게 나뉘는지
        </Text>
      </View>
    ),
  },
  {
    name: "classname-card",
    width: 360,
    height: 420,
    render: () => (
      <View className="flex-1 gap-3 bg-gray-100 p-4">
        <View className="flex-row items-center gap-3 rounded-2xl border border-gray-300 bg-white p-3">
          <View className="h-12 w-12 rounded-full bg-orange-400" />
          <View className="flex-1 gap-1">
            <Text className="font-arimo-bold text-lg">Card title</Text>
            <Text className="font-arimo text-sm text-gray-600">A description line that wraps onto a second line in the card</Text>
          </View>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {["One", "Two", "Three", "Four", "Five"].map(label => (
            <View key={label} className="rounded-full bg-sky-600 px-3 py-1.5">
              <Text className="font-noto text-xs text-white">{label}</Text>
            </View>
          ))}
        </View>
        <View className="aspect-video w-1/2 bg-emerald-500 android:ml-4 ios:ml-2" />
        <Text className="font-noto text-base leading-7 tracking-wide">한글과 English가 섞인 className 텍스트</Text>
      </View>
    ),
  },
  {
    name: "components-scroll",
    width: 320,
    height: 320,
    render: () => (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ height: 120 }} contentContainerStyle={{ padding: 8, gap: 6 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <View key={i} style={{ height: 30, backgroundColor: i % 2 ? "skyblue" : "steelblue" }} />
          ))}
        </ScrollView>
        <ScrollView horizontal style={{ marginTop: 10 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
          {["First", "Second", "Third", "Fourth", "Fifth", "Sixth"].map(label => (
            <View key={label} style={{ paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 14 }}>
              <Text style={{ fontFamily: "Arimo-Regular", fontSize: 14 }}>{label}</Text>
            </View>
          ))}
        </ScrollView>
        <ScrollView>
          <View style={{ height: 40, backgroundColor: "tomato" }} />
        </ScrollView>
      </View>
    ),
  },
  {
    name: "components-flatlist",
    width: 300,
    height: 300,
    render: () => (
      <View style={{ height: 240 }}>
        <FlatList
          data={[1, 2, 3, 4, 5, 6, 7, 8]}
          keyExtractor={item => String(item)}
          contentContainerStyle={{ padding: 10 }}
          ListHeaderComponent={<View style={{ height: 24, backgroundColor: "gold" }} />}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          renderItem={({ item }) => (
            <View style={{ height: 36, justifyContent: "center", paddingHorizontal: 10, backgroundColor: "#eeeeee" }}>
              <Text style={{ fontFamily: "Arimo-Regular", fontSize: 14 }}>Item {item}</Text>
            </View>
          )}
        />
      </View>
    ),
  },
  {
    name: "components-input",
    needsSystemFonts: true,
    width: 320,
    height: 420,
    render: () => (
      <View style={{ flex: 1, padding: 10, gap: 10, alignItems: "flex-start" }}>
        <TextInput style={{ fontFamily: "Arimo-Regular", fontSize: 16 }} value="Hello input" />
        <TextInput style={{ fontFamily: "Arimo-Regular", fontSize: 16, borderWidth: 1, padding: 8, width: 240 }} placeholder="Placeholder text" />
        <TextInput style={{ fontSize: 15, width: 240 }} placeholder="System font placeholder" />
        <TextInput multiline style={{ fontFamily: "Arimo-Regular", fontSize: 15, width: 200 }} value="Multi line text input that wraps onto more lines" />
        <TextInput style={{ height: 44, fontSize: 16, width: 200, paddingHorizontal: 12 }} placeholder="Fixed height" />
      </View>
    ),
  },
  {
    name: "components-controls",
    width: 320,
    height: 360,
    render: () => (
      <View style={{ flex: 1, padding: 10, gap: 10, alignItems: "flex-start" }}>
        <Switch value />
        <Switch value={false} />
        <ActivityIndicator />
        <ActivityIndicator size="large" />
        <Image source={require("../assets/images/sample.png")} />
        <Image source={require("../assets/images/sample.png")} style={{ width: 30 }} />
        <Image source={require("../assets/images/sample.png")} style={{ width: 100, height: 20 }} />
      </View>
    ),
  },
]
