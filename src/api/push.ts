import { graphql } from "@octokit/graphql";

export async function getFieldIds(login: string, isOrg: boolean, projectId: string, token: string): Promise<{ id: string, name: string }[]> {
  const fieldIds = (await graphql(
    `
    query ProjectV2Fields($number: Int!, $login: String!, $first: Int) {
      ${isOrg ? "organization" : "user"}(login: $login) {
        projectV2(number: $number) {
          fields(first: $first) {
            nodes {
              ... on ProjectV2SingleSelectField {
                id
                name
              }
              ... on ProjectV2Field {
                id
                name
              }
              ... on ProjectV2IterationField {
                id
                name
              }
            }
          }
        }
      }
    }
    `,
    {
      headers: {
        authorization: `token ${token}`,
      },
      number: parseInt(projectId),
      login,
      first: 100
    }
  ) as { organization: { projectV2: { fields: { nodes: { id: string, name: string }[] } } } }).organization.projectV2.fields.nodes
  return fieldIds
}

export async function updateField() { }

export async function push(login: string, isOrg: boolean, projectId: string, token: string): Promise<void> {
  const fieldIds = await getFieldIds(login, isOrg, projectId, token);
}
