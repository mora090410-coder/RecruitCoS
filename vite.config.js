import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'internal-test-route',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method === 'GET' && req.url.startsWith('/api/internal/test-weekly-plan/')) {
            const urlParts = req.url.split('/');
            const athleteId = urlParts[urlParts.length - 1].split('?')[0];
            console.log(`\n[INTERNAL_TEST_ROUTE] Weekly plan preview for athlete: "${athleteId}"`);

            try {
              const { buildAthleteProfile } = await server.ssrLoadModule('/src/services/buildAthleteProfile.js');
              const { computeGap } = await server.ssrLoadModule('/src/services/engines/gapEngine.js');
              const { generateWeeklyPlan } = await server.ssrLoadModule('/src/services/engines/weeklyPlanEngine.js');

              const profile = await buildAthleteProfile(athleteId);
              const gapResult = computeGap(profile);
              const weeklyPlan = generateWeeklyPlan(profile, gapResult);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                phase: weeklyPlan.phase,
                primaryGap: gapResult?.primaryGap || null,
                priorities: weeklyPlan.priorities || []
              }));
            } catch (err) {
              console.error('[INTERNAL_TEST_ROUTE] Weekly plan preview failure:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                status: 'INTERNAL_TEST_ERROR',
                message: err.message,
                stack: err.stack
              }));
            }
            return;
          }
          if (req.method === 'POST' && req.url.startsWith('/api/internal/test-recompute/')) {
            const urlParts = req.url.split('/');
            const athleteId = urlParts[urlParts.length - 1].split('?')[0];
            console.log(`\n[INTERNAL_TEST_ROUTE] Manual trigger for athlete: "${athleteId}"`);

            try {
              // Dynamically load modules within Vite context
              const { recomputeAll } = await server.ssrLoadModule('/src/services/recomputeAll.js');
              const { supabase } = await server.ssrLoadModule('/src/lib/supabase.js');

              // 1. Fetch Profile
              console.log(`[INTERNAL_TEST_ROUTE] Querying athletes for id: ${athleteId}`);
              const { data: profile, error: pError } = await supabase
                .from('athletes')
                .select('*')
                .eq('id', athleteId)
                .single();

              if (pError || !profile) {
                console.error(`[INTERNAL_TEST_ROUTE] Error or no profile found:`, pError);
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({
                  error: "Athlete not found",
                  athleteId,
                  details: pError
                }));
              }

              // 2. Execute Pipeline with logging
              console.log("[INTERNAL_TEST_ROUTE] Commencing pipeline...");
              await recomputeAll(profile);

              // Logging stages (recomputeAll logs internally, but we add structured markers here)
              console.log("[INTERNAL_TEST_ROUTE] Gap computed");
              console.log("[INTERNAL_TEST_ROUTE] Readiness computed");
              console.log("[INTERNAL_TEST_ROUTE] Interest computed");
              console.log("[INTERNAL_TEST_ROUTE] Weekly plan generated");

              // 3. Query Results
              const [gap, readiness, interest, plan] = await Promise.all([
                supabase.from('athlete_gap_results').select('*').eq('athlete_id', athleteId).order('computed_at', { ascending: false }).limit(1).maybeSingle(),
                supabase.from('athlete_readiness_results').select('*').eq('athlete_id', athleteId).order('computed_at', { ascending: false }).limit(1).maybeSingle(),
                supabase.from('athlete_school_interest_results').select('*').eq('athlete_id', athleteId).order('computed_at', { ascending: false }).limit(1).maybeSingle(),
                supabase.from('athlete_weekly_plans').select('*').eq('athlete_id', athleteId).order('computed_at', { ascending: false }).limit(1).maybeSingle()
              ]);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                status: "INTERNAL_TEST_SUCCESS",
                athleteId,
                results: {
                  gap: gap.data,
                  readiness: readiness.data,
                  interest: interest.data,
                  weekly_plan: plan.data
                }
              }));

            } catch (err) {
              console.error("[INTERNAL_TEST_ROUTE] Pipeline Failure:", err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                status: "INTERNAL_TEST_ERROR",
                message: err.message,
                stack: err.stack
              }));
            }
            return;
          }
          next();
        });
      }
    }
  ],
})
