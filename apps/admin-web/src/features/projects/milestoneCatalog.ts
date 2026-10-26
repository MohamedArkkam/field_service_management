/** Common site milestones for Admin to tick — one catalog, grouped by phase. */
export type MilestoneOption = {
  id: string
  phase: string
  name: string
}

export const MILESTONE_CATALOG: MilestoneOption[] = [
  { id: 'site-clearing', phase: 'Site & structure', name: 'Site clearing' },
  { id: 'marking-layout', phase: 'Site & structure', name: 'Marking / layout' },
  { id: 'excavation', phase: 'Site & structure', name: 'Excavation' },
  { id: 'pcc', phase: 'Site & structure', name: 'PCC' },
  { id: 'footing', phase: 'Site & structure', name: 'Footings' },
  { id: 'foundation', phase: 'Site & structure', name: 'Foundation' },
  { id: 'plinth', phase: 'Site & structure', name: 'Plinth beam / plinth' },
  { id: 'columns', phase: 'Site & structure', name: 'Columns' },
  { id: 'slab', phase: 'Site & structure', name: 'Slab' },
  { id: 'brickwork', phase: 'Site & structure', name: 'Brickwork / blockwork' },
  { id: 'lintel', phase: 'Site & structure', name: 'Lintel / sunshade' },

  { id: 'roof', phase: 'Envelope', name: 'Roof / roofing sheets' },
  { id: 'external-plaster', phase: 'Envelope', name: 'External plaster' },
  { id: 'doors-windows', phase: 'Envelope', name: 'Doors & windows' },
  { id: 'shopfront', phase: 'Envelope', name: 'Shopfront / shutter' },
  { id: 'waterproofing', phase: 'Envelope', name: 'Waterproofing' },

  { id: 'electrical', phase: 'MEP', name: 'Electrical rough-in' },
  { id: 'plumbing', phase: 'MEP', name: 'Plumbing rough-in' },
  { id: 'electrical-finish', phase: 'MEP', name: 'Electrical fittings' },
  { id: 'plumbing-finish', phase: 'MEP', name: 'Sanitary fittings' },
  { id: 'hvac', phase: 'MEP', name: 'AC / ventilation' },

  { id: 'plaster', phase: 'Interiors', name: 'Internal plaster' },
  { id: 'flooring', phase: 'Interiors', name: 'Flooring' },
  { id: 'tiling', phase: 'Interiors', name: 'Wall tiling' },
  { id: 'painting', phase: 'Interiors', name: 'Painting' },
  { id: 'false-ceiling', phase: 'Interiors', name: 'False ceiling' },
  { id: 'counters', phase: 'Interiors', name: 'Counters / fittings' },
  { id: 'signage', phase: 'Interiors', name: 'Signage' },

  { id: 'snagging', phase: 'Close-out', name: 'Snagging' },
  { id: 'handover', phase: 'Close-out', name: 'Handover' },
]

export function milestonesByPhase(options: MilestoneOption[] = MILESTONE_CATALOG) {
  const groups: { phase: string; items: MilestoneOption[] }[] = []
  const seen = new Map<string, number>()
  for (const opt of options) {
    let idx = seen.get(opt.phase)
    if (idx === undefined) {
      idx = groups.length
      seen.set(opt.phase, idx)
      groups.push({ phase: opt.phase, items: [] })
    }
    groups[idx].items.push(opt)
  }
  return groups
}
