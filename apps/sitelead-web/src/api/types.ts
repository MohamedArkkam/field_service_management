export type Role = 'ADMIN' | 'SITE_LEAD' | 'CLIENT'
export type PayType = 'DAILY' | 'MONTHLY'
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID'
export type ProgressStatus = 'DRAFT' | 'PUBLISHED'

export type User = {
  id: string
  email: string
  fullName: string
  role: Role
  active: boolean
}

export type SiteProject = {
  id: string
  name: string
  location: string | null
  clientDisplayName: string | null
  progressPath: string
}

export type ProgressUpdate = {
  id: string
  projectId: string
  title: string
  note: string | null
  photoUrl: string | null
  status: ProgressStatus
  createdAt: string
  publishedAt: string | null
}

export type Purchase = {
  id: string
  projectId: string
  description: string
  vendorName: string | null
  amount: number
  amountPaid: number
  outstanding: number
  paymentStatus: PaymentStatus
  purchasedOn: string
  note: string | null
}

export type Worker = {
  id: string
  projectId: string
  fullName: string
  payType: PayType
  rate: number
  active: boolean
}

export type Attendance = {
  id: string
  projectId: string
  workerId: string
  workerName: string
  workDate: string
  labourChargeId: string | null
}
