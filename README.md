# ghp - GitHub Projects to (and from) Markdown

## About

**ghp** is synchronizing GitHub Projects with your Kanban board in Markdown.
The Markdown Kanban board is implemented accorting to the [Obsidian Kanban Plugin](https://github.com/mgmeyers/obsidian-kanban) specification. 

## Roadmap

- [-] ProjectV2
	- [x] Download to markdown
	- [ ] Create from markdown
    - [ ] Synchronize markdown with GHP

- [ ] Project (classic)

## Installation and Use

To install dependencies:

```bash
bun install
```

To create kanban from GHP:

```bash
bun run src/index.ts -p <path where kanban should be created> -n <user/organization name> <if organization: -o>
```

## Credits

Creator - Maciej Błędkowski [@mbledkowski](github.com/mbledkowski)