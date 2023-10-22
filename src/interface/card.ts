export interface Card {
  title: string
  body: string
  author: string
  assignees: { name: string | undefined; login: string | undefined }[]
  state: string
  archived: boolean
  id: number
  createdAt: string
  updatedAt: string
  closedAt: string
  labels: string[]
  milestone: string
  status: string
  url: string
}
