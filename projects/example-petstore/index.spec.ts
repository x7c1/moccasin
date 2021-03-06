import { expect } from "chai"
import { load } from "js-yaml"
import { setupTraverser } from "sango/loader/traverse"
import { readFile } from "sango/fs_promise"
import { context } from "./index"

const { traverseTexts, traverseYamls } = setupTraverser(context)

describe("traverseTexts", () => {
  it("concat all texts in a given directory", async () => {
    const loader = await traverseTexts("./components/schemas")()
    const contents = await loader.loadContents()
    const schemas = contents.map(_ => _.dump()).join("")

    expect(schemas).to.include("Error:")
    expect(schemas).to.include("Pet:")
    expect(schemas).to.include("Pets:")
  })
})

describe("traverseYamls", () => {
  it("concat all yamls in a given directory", async () => {
    const loader = await traverseYamls("./paths")()
    const contents = await loader.loadContents()
    const paths = contents.map(_ => _.dump()).join("")

    const m1 = paths.match(/\/pets:/g)!
    expect(m1.length).to.eq(1)

    const m2 = paths.match(/\/pets\/{petId}/g)!
    expect(m2.length).to.eq(1)

    const m3 = paths.match(/\/users\/{userId}/g)!
    expect(m3.length).to.eq(1)
  })
})

describe("generated OpenAPI yaml", () => {

  const read = async () => {
    // run generator by this line
    await require("./index").main

    const path = "./projects/example-petstore/dist/index.gen.yaml"
    const text = await readFile(path)
    return load(text)
  }

  it("should contain paths", async () => {
    const root = await read()
    const paths = root["paths"]
    expect(paths["/pets"]).to.have.property("post")
    expect(paths["/pets"]).to.have.property("get")
    expect(paths["/users/{userId}"]).to.have.property("get")
    expect(paths["/users/{userId}"]).not.to.have.property("post")
  })

  it("should contain components", async () => {
    const root = await read()
    const schemas = root["components"]["schemas"]
    expect(schemas).to.have.property("Error")
    expect(schemas).to.have.property("Pets")
    expect(schemas).to.have.property("Pet")
    expect(schemas).to.have.property("User")
  })
})
