import { mkdirSync, writeFileSync } from "node:fs"
import { createServer } from "node:http"
import { join } from "node:path"

const referenceDir = join(import.meta.dirname, "reference")

createServer((request, response) => {
  let body = ""
  request.on("data", chunk => {
    body += chunk
  })
  request.on("end", () => {
    const data = body ? JSON.parse(body) : {}
    if (request.url === "/dump") {
      const dir = join(referenceDir, `${data.platform}-${data.pixelRatio}x`)
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, data.fixture + ".json"), JSON.stringify(data, null, 2) + "\n")
      console.log(`${data.platform} ${data.fixture}`)
    } else if (request.url === "/done") {
      console.log(`${data.platform} done`)
    }
    response.writeHead(204).end()
  })
}).listen(Number(process.env.PORT ?? 4545), "0.0.0.0")
