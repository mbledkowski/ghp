import { createWriteStream, readFile, ensureDir } from "fs-extra";
import { InternalData } from "../interface";
import { resolve } from "path";
import { markdownTable } from "markdown-table";

export async function internalDataToFiles(data: InternalData, path: string): Promise<void> {
  const main = createWriteStream(resolve(path, `./${data.mainFileName}.md`));
  const mainStart = readFile(resolve(__dirname, "./markdownSnippets/mainStart.md"));
  const mainEnd = readFile(resolve(__dirname, "./markdownSnippets/mainEnd.md"));
  await ensureDir(resolve(path, `./${data.cardsDirName}`));
  main.on('error', (error) => {
    console.log(`An error occured while writing to the file. Error: ${error.message}`);
  });
  main.write(await mainStart);
  {
    for (let i = 0; i < data.lists.length; i++) {
      const key = data.lists[i].name;
      main.write(`## ${key.trim()}\n`);
      for (let i = 0; i < data.lists[i].cards.length; i++) {
        const path = data.lists[i].cards[i].path;
        const card = data.lists[i].cards[i].card;

        const editableTable = [
          ["Property", "Value"],
          ["Author", `[@${card.author}](https://github.com/${card.author})`],
          ["Assigned to", ""],
          ["State", card.state],
          ["Archived", card.archived ? "Yes" : "No"],
        ]

        const urlArray = card.url.split("/");
        const repo = urlArray[2];
        const repoUrl = urlArray.slice(0, -2).join("/");

        const staticTable = [
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

        for (const assignee of card.assignees) {
          editableTable[2][1] += `[@${assignee.login}](https://github.com/${assignee.login})`
        }

        for (const [i, label] of card.labels.entries()) {
          if (i === card.labels.length - 1) {
            staticTable[5][1] += `\`${label}\``
          } else {
            staticTable[5][1] += `\`${label}\` `
          }
        }

        {
          const editableTableMd = markdownTable(editableTable, { align: ["l", "l"] });
          const staticTableMd = markdownTable(staticTable, { align: ["l", "l"] });
          let cardPath = resolve(path, `./${data.cardsDirName}/`, `./${path}.md`);
          const cardFile = createWriteStream(cardPath);
          main.write(`- [ ] **${card.title.trim()}** @{${card.createdAt}} ![Card](./${data.cardsDirName}/${path}.md)\n`)
          cardFile.write(`${card.body}\n\n***\n\n${editableTableMd}\n\n***\n\n<!-- Do NOT change values below! -->\n\n${staticTableMd}`)
          cardFile.close()
        }
      }
      main.write("\n\n")
    }
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
