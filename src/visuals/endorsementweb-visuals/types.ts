export interface Note { text: string; url?: string }
export interface GNode {
  id: string; name: string; type: string; title: string; variants: string[];
  isCandidate: boolean; isTarget: boolean; race?: string; campaignUrl?: string; endorsementsPage?: string;
  typeNote?: string; analysisEndorser?: boolean;
  outDeg: number; inDeg: number; inDegAll?: number; grp?: boolean; leaf: boolean; x: number; y: number; memberOf?: string; status?: string; notes?: Note[];
}
export interface GSrc { u: number; ty?: string; pg?: string; snap?: string; at?: string; pr?: 1; sh?: 1; v?: 1 }
export interface GEdge {
  id: string; s: string; t: string; rel: string; rank: string; rankNote?: string; formality: string; title: string;
  kind: 'endorsement' | 'member'; src: GSrc[]; date: string; asw: string;
}
export interface Ref { n: number; u: number; title: string; url: string; at: string[] }
export interface SlateOverlap {
  slate: string; council: { t: string; j: number; n: number; base?: number; nList: number }[]; nOthersMulti?: number;
  leadBoot?: { a: string; b: string; resamples: number; aLeads: number; tie: number; aMajority: number; bMajority: number }; topKShare: Record<string, number>; top1Share: number; top2Share: number;
  resamples: number; nSlateEndorsers: number;
}
export interface Summary {
  generated: string; nEdges: number; nEndorsementEdges: number; nMemberEdges: number; nNodes: number; nEndorsers: number; nSingle: number; nGroupEndorsers: number; nGroupSingle: number; nGroupEdges: number;
  nCandidates: number; nCore: number; nCoreEdges: number; runs: number; pools: number; nRuns: number;
  zeroDropped?: { pamphletOnly: number; candidates: number; other: number };
  relCounts: Record<string, number>; typeCounts: Record<string, number>;
  endorserTypeCounts: Record<string, number>; sourceTypeCounts: Record<string, number>; edgeSourceTypeCounts: Record<string, number>;
  accessDates: string[]; nPamphletRefsExcluded: number | null; nPamphletPeople: number | null; rankCounts: Record<string, number>;
  nZeroEndorsersDropped: number | null; nUnverifiedLeads?: number;
  cleanFiles: Record<string, string>; downloads?: [string, string][];
  nUnlabelledMoved?: number;
  typeOverrides: { id: string; was: string; now: string; why: string }[];
  validation?: { passed: number; total: number };
}
export interface Data {
  urls: string[]; urlLabels: string[]; refs: Ref[]; photos?: Record<string, string>; slateOverlap: SlateOverlap | null; summary: Summary;
  races: { race: string; candidates: string[] }[]; nodes: GNode[]; edges: GEdge[];
  coTargets: string[];
}
