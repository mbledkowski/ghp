import * as api from './api/projectsV2';
import { program } from 'commander';
import { getLastCommit } from 'git-last-commit';
import prompts from 'prompts';
import { data2map } from './components/data2map';
import { Card } from './interface/card';

async function getVersion() {
  let version = "0.0.0";
  let hash = "";
  await new Promise<void>((resolve) => {
    getLastCommit((_, commit) => {
      version = commit.tags[commit.tags.length - 1] || "0.0.0";
      hash = commit.shortHash;

      resolve();
    })
  })
  return { version, hash };
};

const { version: VERSION, hash: HASH } = await getVersion();

program
  .name("ghp")
  .description('CLI to synchronize your GitHub Projects with local markdown files')
  .version(`${VERSION} (${HASH})`)
  .requiredOption('-p, --path <path>', 'Path to the markdown file')
  .requiredOption('-n, --name <name>', 'Name of the GitHub user or organization') // TODO not required
  .option('-o, --org', 'Flag to indicate that it is an organization (optional)')
  .option('--id <id>', 'Project ID (optional)')

program.parse(process.argv);

const options = program.opts();

const NAME = options.name || "mbledkowski";
const ORG = options.org ? true : false;
const TOKEN = process.env.GHTOKEN || "";
let id = 1;
if (options.id) {
  id = options.id;
} else {
  const projectsRaw = (await api.fetchProjects(NAME, ORG, TOKEN)).getProjects();
  const projects = []
  for (const project of projectsRaw) {
    projects.push({ title: project.getTitle()!, value: project.getProjectNumber()! })
  }
  id = (await prompts({
    type: 'select',
    name: 'value',
    message: 'Pick a project',
    choices: projects,
    initial: 1
  })).value
}

{
  const projectItems = await api.fetchProjectItems(NAME, ORG, id, TOKEN)
  const standardizedProjectItems: Card[] = []
  for (const item of projectItems) {
    standardizedProjectItems.push({ title: item.getTitle()!, body: item.getBody()!, author: item.getAuthor()?.login as string, assignees: item.getAssignees()!, state: item.getState()!, archived: item.isArchived()!, id: parseInt(item.getNumber()!), createdAt: item.getCreatedAt()!, updatedAt: item.getUpdatedAt()!, closedAt: item.getClosedAt()!, labels: item.getLabels()!, milestone: item.getMilestone()!, status: item.getStatus()!, url: item.getUrl()! })
  }
  const data = data2map(standardizedProjectItems);
}
