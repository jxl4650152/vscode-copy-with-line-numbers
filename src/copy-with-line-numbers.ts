'use strict'

import * as leftPad from 'left-pad'
import { EOL } from 'os'
import * as path from 'path'
import * as vscode from 'vscode'

const COPY_WITH_LINE_NUMBERS = 'extension.copyWithLineNumbers'
const COPY_WITH_LINE_NUMBERS_WITHOUT_PATH = COPY_WITH_LINE_NUMBERS + '.withoutPath'
const COPY_WITH_LINE_NUMBERS_WITH_FULL_PATH = COPY_WITH_LINE_NUMBERS + '.withFullPath'
const COPY_WITH_LINE_NUMBERS_WITH_RELATIVE_PATH = COPY_WITH_LINE_NUMBERS + '.withRelativePath'
const COPY_WITH_LINE_NUMBERS_WITH_FILE_NAME = COPY_WITH_LINE_NUMBERS + '.withFileName'

const OPTION_WITH_FULL_PATH = 'withFullPath'
const OPTION_WITH_RELATIVE_PATH = 'withRelativePath'
const OPTION_WITH_FILE_NAME = 'withFileName'

const MULTI_SELECTION_SEPARATOR = '---'

function copyWithLineNumbers(option?) {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showInformationMessage('No editor is active')
    return
  }

  const document = editor.document
  const fullPath = document.fileName
  const relativePath = vscode.workspace.workspaceFolders ?
    path.relative(vscode.workspace.workspaceFolders[0].uri.fsPath, fullPath) : fullPath
  const fileName = path.basename(fullPath)

  let file = ''
  switch (option) {
    case OPTION_WITH_FULL_PATH:
      file = fullPath
      break
    case OPTION_WITH_RELATIVE_PATH:
      file = relativePath
      break
    case OPTION_WITH_FILE_NAME:
      file = fileName
      break
    default:
      break
  }

  let str = file ? `File: ${file}${EOL}` : ''

  const selections = [...editor.selections].sort((a, b) => a.start.line - b.start.line)
  const lastSelection = selections[selections.length - 1]
  const largestLineNumber = lastSelection.end.line + 1
  const largestLineNumberLength = largestLineNumber.toString().length
  let copiedLineCount = 0
  selections.forEach((selection, i) => {
    if (i > 0) str += `${MULTI_SELECTION_SEPARATOR}${EOL}`

    for (let n = selection.start.line; n <= selection.end.line; n += 1) {
      copiedLineCount = copiedLineCount + 1
      const number = leftPad(n + 1, largestLineNumberLength, 0)
      const line = document.lineAt(n).text

      str += `${number}: ${line}${EOL}`
    }
  })

  vscode.env.clipboard.writeText(str).then( () => {
    const showSuccessMessage = vscode.workspace.getConfiguration('copyWithLineNumbers').get('showSuccessMessage')
    if (showSuccessMessage) vscode.window.showInformationMessage(copiedLineCount + ' lines copied!')
  })
}

export const commands = {
  [COPY_WITH_LINE_NUMBERS_WITHOUT_PATH]: () => {
    copyWithLineNumbers()
  },
  [COPY_WITH_LINE_NUMBERS_WITH_FULL_PATH]: () => {
    copyWithLineNumbers(OPTION_WITH_FULL_PATH)
  },
  [COPY_WITH_LINE_NUMBERS_WITH_RELATIVE_PATH]: () => {
    copyWithLineNumbers(OPTION_WITH_RELATIVE_PATH)
  },
  [COPY_WITH_LINE_NUMBERS_WITH_FILE_NAME]: () => {
    copyWithLineNumbers(OPTION_WITH_FILE_NAME)
  },
}
