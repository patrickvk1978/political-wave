import { Link } from 'react-router-dom'

export function MethodologyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
              </svg>
            </div>
            <span className="font-semibold text-sm tracking-wide">WaveWatch</span>
          </Link>
          <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Methodology</h1>
        <p className="text-sm text-slate-500 mb-8">How WaveWatch models legislative outcomes</p>

        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
          {/* Overview */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Overview</h2>
            <p>
              WaveWatch is an interactive projection tool, not a predictive model. It shows how a
              hypothetical uniform Democratic wave of a given size would translate to seat-level
              outcomes across 8 battleground state legislatures. The goal is to help reporters,
              campaign strategists, and political operatives explore scenarios quickly, not to
              forecast election results.
            </p>
          </section>

          {/* Baseline Data */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Baseline Vote Shares</h2>
            <p>
              Each district's baseline competitiveness is derived from the median of recent
              statewide election results at the district level. Where available, we use
              pre-computed median Democratic and Republican vote shares. For states where only
              raw election results are available (Michigan, Minnesota House, Nebraska), we average
              across the available election cycles (typically 2 to 3 races including recent
              gubernatorial and presidential contests) to produce a composite baseline.
            </p>
            <p className="mt-3">
              These baselines reflect the underlying partisan lean of each district, not the
              performance of any individual candidate. They are best understood as an estimate
              of how a generic Democratic and generic Republican candidate would perform in the
              district under neutral conditions.
            </p>
          </section>

          {/* Incumbency */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Incumbency Advantage</h2>
            <p>
              We apply a 2 percentage point personal incumbency advantage when the sitting
              legislator is running for reelection. Open seats receive no incumbency adjustment.
            </p>
            <p className="mt-3">
              This reflects a deliberate choice grounded in the academic literature. Research on
              state legislative elections has historically found incumbency effects in the
              mid-single digits, but more recent work shows a meaningful decline. Rogers (2023)
              finds that the estimated state house incumbency advantage peaked around 6 points in
              the early 2000s but fell to under 2 points by the 2020 and 2022 cycles, a trend he
              attributes to the nationalization of state politics and reduced ticket-splitting
              rather than changes in candidate quality.
            </p>
            <p className="mt-3">
              Importantly, we distinguish between personal incumbency and partisan incumbency.
              Fowler and Hall (2014), using term-limited state legislative races to isolate the
              two effects, find that the personal advantage remains meaningful while the partisan
              advantage (the benefit to the party in an open seat) is indistinguishable from zero.
              For that reason, we do not apply any incumbency bump to open seats.
            </p>
            <p className="mt-3">
              Our 2-point estimate is intentionally conservative. It sits near the low end of the
              historical range, reflecting both the downward trend in incumbency effects and the
              reality that a simple uniform number will never capture the full variation across
              states, chambers, and individual races. We think it is a reasonable approximation
              for an interactive scenario tool, not a definitive estimate.
            </p>
          </section>

          {/* Wave Mechanics */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Wave Mechanics</h2>
            <p>
              The wave slider adds a uniform shift to the Democratic vote share in every district
              that is up for election in 2026. A 6% wave means every district's Democratic
              baseline is increased by 6 percentage points. Republican vote shares are not
              adjusted. This is a simplification: real waves are not perfectly uniform, and
              individual district swings will vary based on candidate quality, spending, and
              local dynamics. But uniform swing models have a long history in political science
              as useful approximations for scenario analysis.
            </p>
          </section>

          {/* Classification */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">District Classification</h2>
            <p>
              After applying the wave and incumbency adjustments, each district is classified
              based on its logistic win probability:
            </p>
            <ul className="mt-3 space-y-1.5 ml-4">
              <li className="flex gap-2">
                <span className="font-semibold text-blue-800 shrink-0">Safe D:</span>
                <span>D win probability 90% or higher</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-400 shrink-0">Lean D:</span>
                <span>D win probability 60–90%</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-purple-500 shrink-0">Competitive:</span>
                <span>D win probability 40–60%</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-red-400 shrink-0">Lean R:</span>
                <span>D win probability 10–40%</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-red-700 shrink-0">Safe R:</span>
                <span>D win probability 10% or lower</span>
              </li>
            </ul>
          </section>

          {/* Win Probability */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Win Probability Model</h2>
            <p>
              We convert each district's adjusted Democratic margin into a win probability using
              a logistic model calibrated on historical lower-house state legislative election
              results. The calibration uses public Klarner/Princeton state legislative data for
              single-member districts and excludes uncontested races and placeholder vote totals.
              This produces a slope parameter of approximately k&nbsp;=&nbsp;12 when margin is
              measured in decimals, generating probabilities that better match the uncertainty of
              state legislative races than more aggressive assumptions would. The goal is a simple,
              transparent, and defensible probability model rather than a black-box forecast.
            </p>
            <p className="mt-3">
              Under this model, a district where Democrats lead by 5 points after the wave is
              applied carries roughly a 73% win probability. A true toss-up (zero margin) is 50%.
              A district where Republicans lead by 5 points gives Democrats about a 27% chance.
              Any district with a win probability between 40% and 60% is labeled
              "Competitive" on the map and in the district table.
            </p>
            <p className="mt-3">
              Projected seat totals for each chamber are calculated by summing win probabilities
              across all districts up for election, then adding holdover seats for staggered
              senates. The result is rounded to the nearest whole seat.
            </p>
          </section>

          {/* Limitations */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Limitations</h2>
            <ul className="space-y-2 ml-4 list-disc">
              <li>
                Uniform swing is a simplification. Real waves affect districts unevenly depending
                on candidate quality, incumbency, spending, and local issues.
              </li>
              <li>
                Baseline vote shares derived from statewide races (presidential and gubernatorial)
                may not perfectly reflect state legislative dynamics, particularly in states where
                down-ballot races have distinct characteristics.
              </li>
              <li>
                The model does not account for redistricting changes that may have occurred after
                the elections used to compute baselines.
              </li>
              <li>
                Nebraska's nonpartisan legislature makes party-based projections inherently less
                reliable. We use presidential vote share as a proxy for partisan lean.
              </li>
              <li>
                This is a scenario exploration tool. It does not incorporate polling, fundraising,
                candidate recruitment, or other predictive inputs.
              </li>
            </ul>
          </section>

          {/* References */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">References</h2>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                Fowler, A. and Hall, A.B. (2014). "Disentangling the Personal and Partisan
                Incumbency Advantages." <em>Quarterly Journal of Political Science</em>, 9(4),
                501-531.
              </li>
              <li>
                Rogers, S. (2023). "The Nationalization of State Legislative Elections."
                Working paper / forthcoming.
              </li>
              <li>
                Ansolabehere, S. and Snyder, J.M. (2002). "The Incumbency Advantage in U.S.
                Elections: An Analysis of State and Federal Offices, 1942-2000."
                <em> Election Law Journal</em>, 1(3), 315-338.
              </li>
              <li>
                Myers, A.S. (2024). "State Legislative Incumbency Advantage."
                <em> State Politics &amp; Policy Quarterly</em>.
              </li>
            </ul>
          </section>
        </div>

        <div className="border-t border-slate-200 mt-12 pt-6 text-xs text-slate-400">
          <Link to="/" className="hover:text-slate-600 transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
