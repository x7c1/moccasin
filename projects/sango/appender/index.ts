import { appendFile, writeFile } from "../fs_promise"
import { FragmentContent } from "../loader/index"
import { Logger } from "../logger"

const warning =
  "# This file is automatically generated.\n" +
  "# Do not modify this file " +
  "-- YOUR CHANGES WILL BE ERASED!\n\n"

interface Appender {
  clear (): Promise<void>
  append (content: string): Promise<void>
  appendAll (contents: FragmentContent[]): Promise<void>
}

class AppenderImpl implements Appender {
  constructor (
    private readonly outputPath: string,
    private readonly logger: Logger,
  ) { }

  clear (): Promise<void> {
    this.logger.info("[Appender] clear: " + this.outputPath)
    return writeFile(this.outputPath, warning)
  }

  append (content: string): Promise<void> {
    this.logger.info("[Appender] append: " + this.outputPath)
    return appendFile(this.outputPath, content)
  }

  appendAll (contents: FragmentContent[]): Promise<void> {
    const append = (content: FragmentContent) =>
      this.append(content.dump()).catch(err => {
        this.logger.error("[Appender] failed to write content: " + content, err)
      })

    return Promise.all(contents.map(append)).then(_ => undefined)
  }
}

interface AppenderParams {
  outputPath: string
  logger: Logger
}

export const Appender = ({ outputPath, logger }: AppenderParams) => {
  return new AppenderImpl(outputPath, logger)
}
