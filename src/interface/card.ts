export interface Card {
  title: string
  body: string
  author: string
  assignees: object
  state: string
  archived: boolean
  id: number
  createdAt: string
  updatedAt: string
  closedAt: string
  labels: object
  milestone: string
  status: string
  url: string
}
