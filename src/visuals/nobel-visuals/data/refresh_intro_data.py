"""Regenerate laureates-full.json from the 63-row Berkeley Inspire CSV."""
import csv
import json
from pathlib import Path

root = Path(__file__).resolve().parent
with (root / 'berkeley_nobels_from_inspire.csv').open(encoding='utf-8-sig', newline='') as source:
    rows = list(csv.DictReader(source))

ids = [row['nobel_laureate_id'] for row in rows]
if len(ids) != len(set(ids)):
    raise ValueError('Nobel laureate IDs must be unique')

people = []
for row in rows:
    people.append({
        'id': row['nobel_laureate_id'],
        'name': row['name'],
        'year': int(row['prize_year']),
        'category': row['prize_category'],
        'relationship': row['relationship'],
        'credentials': row['berkeley_credentials_raw'],
        'description': row['description'],
        'motivation': row['nobel_motivation'],
        'photo': f"photos/inspire/{row['nobel_laureate_id']}.jpg",
        'nobelUrl': row['nobel_link'],
        'gender': row['nobel_gender'],
        'birthCountry': row['nobel_birth_country_now'],
        'ageAtAward': row['nobel_age_at_award'],
        'portion': row['nobel_portion'],
        'affiliationsAtAward': row['nobel_affiliations_at_award'],
    })

(root / 'laureates-full.json').write_text(
    json.dumps(people, ensure_ascii=False, indent=2) + '\n', encoding='utf-8'
)
print(f'Wrote {len(people)} laureates')
