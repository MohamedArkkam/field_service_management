export type Role = 'ADMIN' | 'SITE_LEAD' | 'CLIENT'
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'
export type ProgressStatus = 'DRAFT' | 'PUBLISHED'
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID'

export type User = {
  id: string
  email: string
  fullName: string
  role: Role
  active: boolean
}

export type ProjectSummary = {
  id: string
  name: string
  location: string | null
  priority: Priority
  projectValue: number | null
  progressPath: string
  archived: boolean
  updatedAt: string
  /** Derived: total milestones (not a stored % complete). */
  milestoneCount: number
  /** Distinct milestones with ≥1 PUBLISHED progress update. */
  milestonesWithPublishedProof: number
  publishedUpdateCount: number
  lastPublishedAt: string | null
}

export type ProgressUpdate = {
  id: string
  projectId: string
  milestoneId: string | null
  milestoneName: string | null
  title: string
  note: string | null
  photoUrl: string | null
  status: ProgressStatus
  rating: number | null
  createdAt: string
  publishedAt: string | null
}

export type Milestone = {
  id: string
  projectId: string
  phaseName: string | null
  name: string
  sortOrder: number
  createdAt: string
}

export type Assignment = {
  id: string
  projectId: string
  userId: string
  userEmail: string
  userFullName: string
  assignmentRole: Role
}

export type ProjectDetail = {
  id: string
  name: string
  location: string | null
  clientDisplayName: string | null
  priority: Priority
  projectValue: number | null
  strategicNote: string | null
  progressToken: string
  progressPath: string
  archived: boolean
  createdAt: string
  updatedAt: string
  milestones: Milestone[]
  assignments: Assignment[]
}

export type ProjectLiabilitySummary = {
  projectId: string
  projectName: string
  purchaseOutstanding: number
  labourOutstanding: number
  totalOutstanding: number
  openPurchaseCount: number
  openLabourCount: number
}

export type LiabilityOverview = {
  totalPurchaseOutstanding: number
  totalLabourOutstanding: number
  totalOutstanding: number
  projects: ProjectLiabilitySummary[]
}
