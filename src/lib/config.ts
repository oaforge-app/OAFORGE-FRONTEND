export const QUERY_KEY = {
  // Auth
  me: ["me"] as const,

  // Assessments
  my_assessments:   ["assessments", "mine"]          as const,
  assessment:       (id: string) => ["assessments", id] as const,

  // Session (within an assessment)
  session:          (assessmentId: string) => ["assessments", assessmentId, "session"] as const,

  // Results
  my_results:       ["results", "me"]                as const,
  result_detail:    (id: string) => ["results", id]  as const,

  // User profile
  user_profile:     ["user", "me"]                   as const,

  // Namespace keys for bulk invalidation
  reset_assessments: ["assessments"]                 as const,
  reset_results:    ["results"]                      as const,
};