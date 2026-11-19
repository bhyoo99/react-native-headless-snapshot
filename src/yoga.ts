import { loadYoga, type Yoga } from "yoga-layout/load"

let yoga: Yoga | undefined
let loading: Promise<Yoga> | undefined

export const initYoga = (): Promise<Yoga> => {
  if (!loading) {
    loading = loadYoga().then(loaded => (yoga = loaded))
  }
  return loading
}

export const getYoga = (): Yoga => {
  if (!yoga) {
    throw new Error("yoga-layout has not been loaded yet, call initYoga() in a beforeAll hook first")
  }
  return yoga
}
