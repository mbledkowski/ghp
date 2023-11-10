import { createWriteStream, readFile, ensureDir } from "fs-extra";
import { Card, InternalData } from "../interface";
import { resolve } from "path";
import { markdownTable } from "markdown-table";

function createTablesFromCard(card: Card) {
  const editableTable = [
    ["Property", "Value"],
    ["Author", `[@${card.author}](https://github.com/${card.author})`],
    ["Assigned to", ""],
    ["State", card.state],
    ["Archived", card.archived ? "Yes" : "No"],
  ]

  let staticTable: string[][]

  for (const assignee of card.assignees) {
    editableTable[2][1] += `[@${assignee.login}](https://github.com/${assignee.login})`
  }

  {
    const urlArray = card.url.split("/");
    const repo = urlArray[2];
    const repoUrl = urlArray.slice(0, -2).join("/");

    staticTable = [
      ["Property", "Value"],
      ["ID", `[${card.id}](${card.url})`],
      ["Created at", card.createdAt],
      ["Updated at", card.updatedAt],
      ["Closed at", card.closedAt],
      ["Labels", ""],
      ["Milestone", card.milestone],
      ["Status", card.status],
      ["Repository", `[${repo}](${repoUrl})`],
    ]

    for (const [i, label] of card.labels.entries()) {
      if (i === card.labels.length - 1) {
        staticTable[5][1] += `\`${label}\``
      } else {
        staticTable[5][1] += `\`${label}\` `
      }
    }
  }

  return { editableTable, staticTable }
}

export async function internalDataToFiles(data: InternalData, path: string): Promise<void> {
  const main = createWriteStream(resolve(path, `./${data.mainFileName}.md`));
  const mainStart = readFile(resolve(__dirname, "./markdownSnippets/mainStart.md"));
  const mainEnd = readFile(resolve(__dirname, "./markdownSnippets/mainEnd.md"));
  await ensureDir(resolve(path, `./${data.cardsDirName}`));
  main.on('error', (error) => {
    console.log(`An error occured while writing to the file. Error: ${error.message}`);
  });
  main.write(await mainStart);
  for (const listItem of data.lists) {
    const key = listItem.name;
    main.write(`## ${key.trim()}\n`);
    for (const cardWithPath of listItem.cards) {
      const path = cardWithPath.path;
      const card = cardWithPath.card;

      const { editableTable, staticTable } = createTablesFromCard(card);

      const editableTableMd = markdownTable(editableTable, { align: ["l", "l"] });
      const staticTableMd = markdownTable(staticTable, { align: ["l", "l"] });

      const cardPath = resolve(path, `./${data.cardsDirName}/`, `./${path}.md`);
      const cardFile = createWriteStream(cardPath);

      main.write(`- [ ] **${card.title.trim()}** @{${card.createdAt}} ![Card](./${data.cardsDirName}/${path}.md)\n`)
      cardFile.write(`${card.body}\n\n***\n\n${editableTableMd}\n\n***\n\n<!-- Do NOT change values below! -->\n\n${staticTableMd}`)
      cardFile.close()
    }
    main.write("\n\n")
  }
  main.write(await mainEnd);
  main.close();

  await ensureDir(resolve(path, "./.ghp"));
  {
    const mainInternal = createWriteStream(resolve(path, "./.ghp/data.json"))
    mainInternal.write(JSON.stringify(data));
    mainInternal.close();
  }
}
