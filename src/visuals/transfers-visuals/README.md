# Transfers visual options

`AdmissionsDots.js` adds the major/school admissions scatterplot. A fixed palette separates the six admission-dot groups: purple, blue, green,
orange, vermilion and gray.
The chart supports search, keyboard selection, click/tap details and a data table.
The component imports only admissions data and computes fixed dot positions once.

Regenerate admissions data with `python3 src/visuals/transfers-visuals/scripts/prepare_admissions.py`.
The exports have no year column. `UCB Major Table.xlsx` is the renamed Berkeley
source; eight other campuses use their supplied `UC* Major Table.csv` files.
`admissions.json` contains all nine campuses. `ADMISSIONS_AUDIT.md` records
count/GPA checks, extreme rates and differences from the campus summary. Repeated major names in different schools remain
distinct. Blank grouped school/discipline cells are forward-filled.

`uc_transfers_by_community_college_2025-26.csv` is the latest-year-only copy of
the original full enrollment CSV. The data preparation script regenerates it
alongside `data.json`, preserving every source column and the full original file.

The story currently embeds only `<AdmissionsDots />`. The unused `TransferVisual.js` retains 12 `<TransferVisual type="…" />` components: ranking, trend, heatmap, majors, treemap, destinations, mix, trajectories, scatter, change, concentration and profile.

Charts use D3 scales, grouping, lines and treemap layout with React-rendered SVG. Controls are local to each option. Every option has source-cell table access and a CSV download; dense charts scroll horizontally on small screens.

## Data

The supplied `uc_transfers_by_community_college.csv` contains published enrollment cells, not admissions data. `data.json` encodes each row as college, year, campus, CIP family and CIP subfamily dictionary indices followed by the enrollment count. Regenerate it with:

```sh
python3 src/visuals/transfers-visuals/scripts/prepare_data.py
```

The generator preserves all 24,798 rows, exact source labels and blank CIP labels. No missing combinations are filled with zero and no college aliases are merged. Shares refer only to published sums. The stacked campus chart leaves absent campus observations unpainted; it does not establish that those campuses received no transfers. Trend gaps remain gaps. Comparisons across years include only colleges observed in both endpoints; the scatter includes only colleges observed at both campuses.

Source: UC Transfers by major, By community college tab, supplied extraction retrieved October 27, 2026. Original extraction materials in `extra/` are ignored by Git; runtime charts do not depend on them.

Admission dots use six editorial color groups: Arts & Humanities; Engineering &
Computing (Engineering + Computer Science); Life Sciences & Health (Life Sciences
+ Public Health); Physical Sciences & Math; Social Sciences & Public Affairs
(Social Sciences + Public Admin); and Other (Architecture, Business,
Other/Interdisciplinary, Undeclared). Raw source disciplines are preserved.
The search is the only control on the major chart; legend counts include all dots.

The vertical axis uses the midpoint of each published admitted-student GPA range.
Admission-rate coordinates are exact; vertical positions shift to the nearest
collision-free position around the GPA midpoint. Larger dots settle first. Missing ranges are omitted
from the plot and retained in the table.

The campus dropdown selects each campus’s own cached chart and source counts.
San Francisco has no supplied export. Source data is never fabricated for it.
