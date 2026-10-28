"""Build a compact, lossless chart dataset from the supplied CSV."""
import csv
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
with (root / 'uc_transfers_by_community_college.csv').open(encoding='utf-8-sig', newline='') as source:
    reader = csv.DictReader(source)
    columns = reader.fieldnames
    rows = list(reader)
latest_year = max(row['Academic year'] for row in rows)
latest_rows = [row for row in rows if row['Academic year'] == latest_year]
latest_path = root / f'uc_transfers_by_community_college_{latest_year}.csv'
with latest_path.open('w', encoding='utf-8-sig', newline='') as target:
    writer = csv.DictWriter(target, fieldnames=columns)
    writer.writeheader()
    writer.writerows(latest_rows)
print(f'Wrote {len(latest_rows):,} rows for {latest_year} to {latest_path.name}.')
fields = ['Community college', 'Academic year', 'Campus', 'CIP family title', 'CIP subfamily title']
labels = [sorted({row[field] for row in rows}) for field in fields]
indices = [{label: i for i, label in enumerate(values)} for values in labels]
values = [[indices[i][row[field]] for i, field in enumerate(fields)] + [int(row['Enrollees'])] for row in rows]
assert all(row[-1] > 0 for row in values)
assert sum(row[-1] for row in values) == sum(int(row['Enrollees']) for row in rows)
result = dict(zip(['colleges', 'years', 'campuses', 'families', 'majors'], labels))
result['rows'] = values
(root / 'data.json').write_text(json.dumps(result, separators=(',', ':')) + '\n')
print(f'Prepared {len(values):,} published cells; {len(labels[0])} source college labels.')
