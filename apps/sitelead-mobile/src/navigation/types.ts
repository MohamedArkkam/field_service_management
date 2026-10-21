export type RootStackParamList = {
  Login: undefined
  Projects: undefined
  ProjectHome: { projectId: string; projectName: string }
  Progress: { projectId: string; projectName: string }
  Purchases: { projectId: string; projectName: string }
  Workers: { projectId: string; projectName: string }
}
