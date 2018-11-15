import { readdir, stat } from "../fs_promise"
import { FragmentsLoader, fromTexts, fromYamls } from "./loader"

// rf. https://stackoverflow.com/a/46700791
const nonEmpty = <A> (value: A | null | undefined): value is A => {
  return value !== null && value !== undefined
}

const toDirectoryPath = (dir: string) => async (file: string): Promise<string | null> => {
  const path = dir + "/" + file
  const stats = await stat(path)
  return stats.isDirectory() ? path : null
}

const directoriesOf = async (dir: string): Promise<string[]> => {
  const files = await readdir(dir)
  const dirs = files.map(toDirectoryPath(dir))
  return (await Promise.all(dirs)).filter(nonEmpty)
}

export const traverseTexts = (dir: string): Traverser => () => {
  return fromTexts(dir)
}

export const traverseYamls = (dir: string): Traverser => () => {
  const merge = (loaders: FragmentsLoader[]) => loaders.reduce(
    (a, b) => a.appendLoader(b),
  )
  const traverseAll = (dirs: string[]) => Promise.all(
    dirs.map(fromYamls),
  )
  return directoriesOf(dir).
    then(traverseAll).
    then(merge)
}

export interface Traverser {
  (): Promise<FragmentsLoader>
}
