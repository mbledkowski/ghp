import { Card, InternalData } from "../interface";
import { readFile } from "fs-extra";
import { resolve } from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";

// Return internalData
async function readMarkdown(mainFileName: string, cardsDirName: string, path: string) {
  const mainFile = await readFile(resolve(path, `./${mainFileName}.md`), 'utf8');
  const mainFileObject = unified()
    .use(remarkParse)
    .parse(mainFile);
  for (let i = 1; i < mainFileObject.children.length; i++) {
    const prevElement = mainFileObject.children[i - 1];
    const element = mainFileObject.children[i];
    if (prevElement.type === "heading" && element.type === "list" && "value" in prevElement.children[0]) {
      const groupName = prevElement.children[0].value;
      const groupItems: (string)[][] = [];
      for (let i = 0; i < element.children.length; i++) {
        const listItem = element.children[i];
        if (listItem.hasOwnProperty("type") && listItem.type === "listItem") {
          for (let i = 0; i < listItem.children.length; i++) {
            const inListItem = listItem.children[i]
            groupItems.push([])
            if (inListItem.hasOwnProperty("type") && inListItem.type === "paragraph") {
              for (let i = 0; i < inListItem.children.length; i++) {
                const paragraphItem = inListItem.children[i];
                const timestampRegex = /@{[A-Z0-9-:]*}/;
                if (i === 0 && paragraphItem.type === "text" && (paragraphItem.value === "[ ] " || "[x] ")) {
                  continue;
                } else if (paragraphItem.type === "strong" && "value" in paragraphItem.children[0] && !timestampRegex.test(paragraphItem.children[0].value)) {
                  groupItems[groupItems.length - 1].push(paragraphItem.children[0].value)
                } else if (paragraphItem.type === "text" && "value" in paragraphItem && !timestampRegex.test(paragraphItem.value)) {
                  groupItems[groupItems.length - 1].push(paragraphItem.value)
                } else if (paragraphItem.type === "image" || paragraphItem.type === "link") {
                  groupItems[groupItems.length - 1].push(paragraphItem.url)
                }
              }
              break;
            }
          }
        }
      }
      console.log(groupName, groupItems)
    }
  }
}

// async function readInternalData(path: string)

// export async function sync(data: Map<string, Card[]>, path: string) {

// }

readMarkdown("Kanban", "Cards", "/home/mble/Code/repos/mbledkowski/ghp/test/")
