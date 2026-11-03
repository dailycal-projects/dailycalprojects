"""Normalize supplied UC XLSX / UTF-16 Tableau exports and audit their values."""
import csv
import io
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NAMES = dict(UCB='Berkeley', UCD='Davis', UCI='Irvine', UCLA='Los Angeles', UCM='Merced', UCR='Riverside', UCSD='San Diego', UCSB='Santa Barbara', UCSC='Santa Cruz')
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

def read_rows(path):
    if path.suffix == '.xlsx':
        with zipfile.ZipFile(path) as archive:
            strings = [''.join(node.itertext()) for node in ET.fromstring(archive.read('xl/sharedStrings.xml')).findall('m:si', NS)]
            sheet = ET.fromstring(archive.read('xl/worksheets/sheet1.xml'))
            rows = []
            for row in sheet.findall('.//m:row', NS):
                values = [''] * 10
                for cell in row.findall('m:c', NS):
                    value = cell.find('m:v', NS)
                    text = value.text if value is not None else ''
                    column = ord(re.sub(r'\d', '', cell.get('r'))) - ord('A')
                    values[column] = strings[int(text)] if cell.get('t') == 's' else text
                rows.append(values)
            return [dict(zip(rows[0], row)) for row in rows[1:]]
    raw = path.read_bytes()
    text = raw.decode('utf-16' if raw[:2] in (b'\xff\xfe', b'\xfe\xff') else 'utf-8-sig')
    return list(csv.DictReader(io.StringIO(text), delimiter='\t' if '\t' in text.splitlines()[0] else ','))

def number(value):
    clean = value.strip().replace(',', '')
    return int(clean) if clean.isdigit() else None

campuses = {}
issues = []
outliers = []
for code, name in NAMES.items():
    path = ROOT / f'{code} Major Table.{"xlsx" if code == "UCB" else "csv"}'
    records = []
    discipline = school = ''
    for row in read_rows(path):
        if not row.get('Major name', '').strip():
            continue
        discipline = row['Broad discipline'].strip() or discipline
        school = row['College/School'].strip() or school
        record = dict(discipline=discipline, school=school, name=row['Major name'].strip(), applicants=number(row['Applicants']), admits=number(row['Admits']), enrollees=number(row['Enrollees']), admitGpa=row['Admit GPA range'].strip(), enrolleeGpa=row['Enrollee GPA range'].strip())
        context = f'UC {name}: {record["name"]} ({school})'
        a, d, e = (record[k] for k in ('applicants', 'admits', 'enrollees'))
        if any(v is None for v in (a, d, e)):
            issues.append(f'{context}: unavailable/redacted count; retained as null.')
        if a is not None and d is not None:
            assert 0 <= d <= a, f'{context}: impossible admits/applicants {d}/{a}'
            if a >= 50 and (d / a <= .05 or d / a >= .95):
                outliers.append(f'{context}: {d:,}/{a:,} admitted ({d/a:.1%}).')
        if d is not None and e is not None:
            assert e <= d, f'{context}: enrollees exceed admits'
        for key in ('admitGpa', 'enrolleeGpa'):
            bounds = re.fullmatch(r'(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)', record[key])
            if bounds:
                low, high = map(float, bounds.groups())
                assert 0 <= low <= high <= 4, f'{context}: invalid {key}: {record[key]}'
            elif key == 'admitGpa':
                issues.append(f'{context}: admitted GPA unavailable ({record[key]}); omitted from plot.')
        for field, numerator, denominator in [('Admit rate', d, a), ('Yield rate', e, d)]:
            raw = row[field].strip().removesuffix('%')
            if raw.isdigit() and numerator is not None and denominator:
                if abs(float(raw) - 100 * numerator / denominator) > .51:
                    issues.append(f'{context}: {field} {row[field]} differs from count-based {numerator/denominator:.1%}.')
        records.append(record)
    assert len({(r['name'], r['school']) for r in records}) == len(records), f'{name}: duplicate rows'
    campuses[name] = dict(source=path.name, majors=records)

(ROOT / 'admissions.json').write_text(json.dumps(dict(year=None, campuses=campuses), indent=2) + '\n')
report = ['# Admissions data audit', '', 'Generated from the supplied exports. No year is encoded in these files. Outliers below are review flags, not corrections. Counts and labels are preserved; redacted/missing values stay null.', '', '| Campus | Major rows | Applicants (sum) | Admits (sum) | Enrollees (sum) |', '| --- | ---: | ---: | ---: | ---: |']
for name, campus in campuses.items():
    rows = campus['majors']
    totals = [sum(r[k] or 0 for r in rows) for k in ('applicants', 'admits', 'enrollees')]
    report.append(f'| {name} | {len(rows)} | ' + ' | '.join(f'{n:,}' for n in totals) + ' |')
report += ['', '## Missing data and inconsistencies', ''] + (['- ' + issue for issue in issues] or ['None found within major rows.'])
report += ['', '## Extreme admission rates', '', 'Review threshold: at least 50 applicants and a rate ≤5% or ≥95%. These can be valid source values.', ''] + ['- ' + issue for issue in outliers]
report += ['', '## Campus-total comparison', '', 'Major sums may omit suppressed/unpublished rows or reflect different export filters; differences do not establish errors. Do not invent a residual major.']
for row in read_rows(ROOT / 'Campus Broad.csv'):
    name = NAMES[row['Campus']]
    totals = {key: sum(r[field] or 0 for r in campuses[name]['majors']) for key, field in [('Applicants', 'applicants'), ('Admits', 'admits'), ('Enrollees', 'enrollees')]}
    differences = [f'{key.lower()} {totals[key] - number(row[key]):+,}' for key in totals if totals[key] != number(row[key])]
    if differences:
        report.append(f'- UC {name}: major sums minus campus counts: ' + '; '.join(differences) + '.')
report += ['', 'UCLA is missing from Campus Broad.csv, so its campus totals cannot be cross-checked. UC San Francisco has no supplied major export.', '']
(ROOT / 'ADMISSIONS_AUDIT.md').write_text('\n'.join(report))
print(f'Prepared {sum(len(c["majors"]) for c in campuses.values())} major rows for {len(campuses)} campuses; {len(issues)} missing/inconsistent values, {len(outliers)} extreme rates. See ADMISSIONS_AUDIT.md.')
