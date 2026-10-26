import { request } from '../../shared/api/http'
import type { LiabilityOverview } from '../../shared/types'

export const liabilitiesApi = {
  liabilities: () => request<LiabilityOverview>('/api/admin/liabilities'),
}