import { createWriteStream, readFile, ensureDir, exists } from "fs-extra";
import { Card, InternalData } from "../interface";
import { resolve } from "path";
import { markdownTable } from "markdown-table";
import sanitize from "sanitize-filename";

export async function map2files(data: Map<string, Card[]>, path: string): Promise<void> {
  const mainFileName = "Kanban";
  const main = createWriteStream(resolve(path, `./${mainFileName}.md`));
  const mainStart = readFile(resolve(__dirname, "./mainStart.md"));
  const mainEnd = readFile(resolve(__dirname, "./mainEnd.md"));
  const cardsDirName = "Cards";
  ensureDir(resolve(path, `./${cardsDirName}`));
  const internalData: InternalData = { mainFileName, cardsDirName, lists: [] }
  main.on('error', (error) => {
    console.log(`An error occured while writing to the file. Error: ${error.message}`);
  });
  main.write(await mainStart);
  {
    const mapIterator = data.keys();
    for (const key of mapIterator) {
      main.write(`## ${key}\n`);
      internalData.lists.push({ name: key, cards: [] });
      {
        const cards = data.get(key)!;
        for (const card of cards) {
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
            const sanitizedTitle = sanitize(card.title).split(" ").join("_");
            let cardPath = resolve(path, `./${cardsDirName}/${sanitizedTitle}.md`);
            let numberOfTries = 0;
            while (await exists(cardPath)) {
              let digitsToReplace = numberOfTries.toString.length;
              if (numberOfTries === 0) { digitsToReplace = 0 };
              cardPath.slice(0, -(digitsToReplace + 4));
              cardPath += `_${numberOfTries}.md`;
            }
            {
              const cardFile = createWriteStream(cardPath);
              let cardFileName = "";
              if (numberOfTries === 0) {
                cardFileName = `${sanitizedTitle}`;
              } else {
                cardFileName = `${sanitizedTitle}_${numberOfTries}`;
              }
              main.write(`- [ ] **${card.title}** @{${card.createdAt}} ![Card](./${cardsDirName}/${cardFileName}.md)\n`)
              internalData.lists[internalData.lists.length - 1].cards.push({
                path: cardFileName,
                card
              })
              cardFile.write(`${card.body}\n\n***\n\n${editableTableMd}\n\n***\n\n<!-- Do NOT change values below! -->\n\n${staticTableMd}`)
              cardFile.close()
            }
          }
        }
      }
      main.write("\n\n")
    }
  }
  main.write(await mainEnd);
  main.close();

  ensureDir(resolve(path, "./.ghp"));
  {
    const mainInternal = createWriteStream(resolve(path, "./.ghp/data.json"))
    mainInternal.write(JSON.stringify(internalData));
    mainInternal.close();
  }
}
