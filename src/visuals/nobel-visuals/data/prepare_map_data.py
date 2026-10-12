"""Regenerate map-ready records from laureates-full.json."""

from collections import Counter
from datetime import date
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "laureates-full.json"
OUTPUT = ROOT / "map-ready.json"
AUDIT = ROOT / "map-audit.md"

COUNTRY_CODES = {
    "USA": "US", "Canada": "CA", "France": "FR", "Sweden": "SE",
    "Ukraine": "UA", "Lithuania": "LT", "Israel": "IL", "Italy": "IT",
    "Mexico": "MX", "United Kingdom": "GB", "Jordan": "JO",
    "Hungary": "HU", "Taiwan": "TW", "Germany": "DE", "Japan": "JP",
}
COUNTRY_OVERRIDE = {
    # Nobel's 2025 physics popular-science PDF states Martinis was born in Los Angeles.
    "John Martinis": {
        "country": "USA",
        "source": "https://www.nobelprize.org/uploads/2025/12/popular-physicsprize2025-4.pdf",
    }
}


def affiliation(raw):
    parts = [part.strip() for part in raw.split(",")]
    country = parts[-1] if parts and parts[-1] in COUNTRY_CODES else None
    city = None
    region = None
    if country == "USA" and len(parts) >= 4:
        city, region = parts[-3:-1]
    elif country and len(parts) >= 3:
        city = parts[-2]
    return {
        "name": raw,
        "city": city,
        "region": region,
        "country": country,
        "countryCode": COUNTRY_CODES.get(country),
        "locationStatus": "place-resolved" if city else "country-only" if country else "unresolved",
        "coordinates": None,
    }


def main():
    source = json.loads(SOURCE.read_text())
    records = []
    affiliations = []
    for person in source:
        source_country = person.get("birthCountry", "").strip()
        override = COUNTRY_OVERRIDE.get(person["name"]) if not source_country else None
        country = source_country or (override or {}).get("country")
        prizes = [affiliation(raw.strip()) for raw in person.get("affiliationsAtAward", "").split(";") if raw.strip()]
        record = {
            "id": person["id"], "name": person["name"], "year": person["year"],
            "category": person["category"], "relationship": person["relationship"],
            "birthCountry": country, "birthCountryCode": COUNTRY_CODES.get(country),
            "birthCountrySource": "laureates-full.json" if source_country else (override or {}).get("source"),
            "awardAffiliations": prizes,
        }
        records.append(record)
        affiliations.extend(prizes)
    countries = Counter(row["birthCountry"] or "Unknown" for row in records)
    missing_birth = [row["name"] for row in records if not row["birthCountryCode"]]
    missing_affiliations = [row["name"] for row in records if not row["awardAffiliations"]]
    unresolved_places = sorted({row["name"] for row in affiliations if row["locationStatus"] != "place-resolved"})
    stanford = [row["name"] for row in records if any("Stanford University" in place["name"] for place in row["awardAffiliations"])]
    OUTPUT.write_text(json.dumps({
        "generatedFrom": SOURCE.name,
        "generatedOn": date.today().isoformat(),
        "people": records,
        "summary": {
            "people": len(records), "birthCountries": dict(sorted(countries.items())),
            "awardAffiliationEntries": len(affiliations),
            "awardPlacesNeedingReview": unresolved_places,
            "stanfordAffiliatedPeopleAtAward": stanford,
        },
    }, ensure_ascii=False, indent=2) + "\n")
    AUDIT.write_text(f"""# Map data audit

Regenerate with `python3 data/prepare_map_data.py` after updating `laureates-full.json`.
No geographic visual is published yet. The prepared records preserve the source's
birth-country values and award-affiliation strings, plus parsed locations.

- People: {len(records)}
- Birth countries with a code: {len(records) - len(missing_birth)}
- Missing or unrecognized birth country: {', '.join(missing_birth) or 'none'}
- People without an award-affiliation entry: {', '.join(missing_affiliations) or 'none'}
- Stanford University or its medical school at time of award: {len(stanford)} people ({', '.join(stanford)})
- Affiliation entries without a city-level place: {', '.join(unresolved_places) or 'none'}

John Martinis has a blank birth country in the source data. The output uses USA,
supported by [Nobel's 2025 physics background](https://www.nobelprize.org/uploads/2025/12/popular-physicsprize2025-4.pdf),
which says he was born in Los Angeles. This override is explicit in the script;
the source file remains untouched.

Affiliation city parsing is a starting point for cartography. The `coordinates`
fields are deliberately null until each place is geocoded and checked. Entries
like Howard Hughes Medical Institute, USA and LIGO/VIRGO Collaboration do not
identify a single city and must remain unresolved. Birth-country geography
answers where laureates were born; affiliation geography answers where they
worked when awarded. These should be distinct map views.
""")


if __name__ == "__main__":
    main()
