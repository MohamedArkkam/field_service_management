export type RootStackParamList = {
  Login: undefined
  Projects: undefined
  ProjectHome: { projectId: string; projectName: string }
  Progress: { projectId: string; projectName: string }
  NewProgress: { projectId: string; projectName: string }
  Purchases: { projectId: string; projectName: string }
  NewPurchase: { projectId: string; projectName: string }
  Workers: { projectId: string; projectName: string }
  NewWorker: { projectId: string; projectName: string }
}
