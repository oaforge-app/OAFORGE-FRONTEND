// src/lib/config.ts
export const QUERY_KEY = {
  me:                 ["me"]                          as const,
  available_sections: ["sections", "available"]       as const,
  my_sections:        ["sections", "mine"]            as const,
  active_session:     ["test", "session", "active"]   as const,
  session:            (id: string) => ["test", "session", id] as const,
  my_results:         ["results", "me"]               as const,
  results_summary:    ["results", "me", "summary"]    as const,
  result_detail:      (id: string) => ["results", id] as const,
  // Namespace keys for bulk invalidation
  reset_sections:     ["sections"]                    as const,
  reset_results:      ["results"]                     as const,
};