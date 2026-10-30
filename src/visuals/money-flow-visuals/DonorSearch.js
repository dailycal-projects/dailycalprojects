import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import * as d3 from 'd3';
import { withPrefix } from 'gatsby';
import { theme } from '../../styles/theme';

// Built from scripts/uc_donor_search.py: every contribution behind the map and
// the PAC chart, plus party and joint fundraising committees, one row per
// donation. Type is Candidate, PAC, Party or JFC; only candidates have a state.
const DATA_URL = withPrefix('/money-flow/uc_donor_search.csv');

const MAX_SUGGESTIONS = 8;
const LISTBOX_ID = 'donor-search-suggestions';
const URL_PARAM = 'donor';

const formatDollars = (v) => {
  const text = d3.format(Number.isInteger(v) ? '$,.0f' : '$,.2f')(Math.abs(v));
  return v < 0 ? `−${text}` : text;
};
const formatContributions = (n) => `${d3.format(',')(n)} contribution${n === 1 ? '' : 's'}`;
const formatDate = d3.timeFormat('%b. %-d, %Y');
const parseDate = d3.timeParse('%Y-%m-%d');

// FEC names are all caps, "LAST, FIRST MIDDLE"; keep that order, in title case.
const formatDonor = (raw) => raw.toLowerCase()
  .replace(/(^|[\s'(-])\p{L}/gu, (c) => c.toUpperCase())
  .replace(/\bMc(\p{L})/gu, (_, c) => `Mc${c.toUpperCase()}`);

// Lowercase words with accents and punctuation dropped, for matching.
const tokenize = (text) => text.toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .split(/[^a-z0-9]+/)
  .filter(Boolean);

const KIND_LABELS = { JFC: 'Joint fundraising committee', Party: 'Party committee' };
const recipientKind = (type, state) => (type === 'Candidate' ? `Candidate, ${state}` : KIND_LABELS[type] || type);

// The summary line splits a donor's total into these groups, skipping empty ones.
const SUMMARY_GROUPS = [
  { label: 'candidates', types: ['Candidate'] },
  { label: 'PACs', types: ['PAC'] },
  { label: 'parties and joint fundraising committees', types: ['Party', 'JFC'] },
];
const joinList = (items) => (items.length < 3
  ? items.join(' and ')
  : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);

const cell = {
  padding: '6px 8px',
  borderBottom: '1px solid #e3e3e3',
  verticalAlign: 'top',
};

const DonorSearch = () => {
  const rootRef = useRef();
  const loadRef = useRef(null);
  const [donors, setDonors] = useState(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);

  // The file is about 140KB gzipped, so it's fetched only once the search is
  // near the screen or the reader starts typing.
  const load = () => {
    if (!loadRef.current) {
      loadRef.current = d3.csv(DATA_URL, (r) => ({
        name: r.name,
        date: parseDate(r.date),
        recipient: r.recipient,
        type: r.type,
        state: r.state,
        amount: +r.amount,
      })).then((rows) => {
        const list = Array.from(d3.group(rows, (r) => r.name), ([name, gifts]) => ({
          name,
          label: formatDonor(name),
          tokens: tokenize(name),
          total: d3.sum(gifts, (g) => g.amount),
          // Refunds aren't contributions of their own.
          count: gifts.filter((g) => g.amount > 0).length,
          gifts: gifts.sort((a, b) => b.date - a.date),
        }));
        // Biggest donors are suggested first.
        list.sort((a, b) => b.total - a.total);
        setDonors(list);
        return list;
      });
    }
    return loadRef.current;
  };

  const show = (donor) => {
    setSelected(donor);
    setQuery(donor.label);
    setOpen(false);
  };

  // Picking a name puts it in the URL (as reported, e.g. ?donor=SHENKER%2C+SCOTT)
  // so the lookup can be shared; other parameters are kept.
  const choose = (donor) => {
    show(donor);
    const params = new URLSearchParams(window.location.search);
    params.set(URL_PARAM, donor.name);
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, '', `${pathname}?${params}${hash}`);
  };

  // A page opened with a donor's name in the URL shows that donor and scrolls here.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get(URL_PARAM);
    if (!wanted) return undefined;
    let cancelled = false;
    load().then((list) => {
      const donor = list.find((d) => d.name === wanted.trim().toUpperCase());
      if (cancelled || !donor) return;
      show(donor);
      rootRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      load();
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        load();
        observer.disconnect();
      }
    }, { rootMargin: '600px 0px' });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  // A name matches when every typed word starts one of its words, so "scott
  // shenker", "shenker s" and "shen" all find "SHENKER, SCOTT".
  const suggestions = useMemo(() => {
    const words = tokenize(query);
    if (!donors || !words.length) return [];
    const found = [];
    for (let i = 0; i < donors.length && found.length < MAX_SUGGESTIONS; i += 1) {
      const d = donors[i];
      if (words.every((w) => d.tokens.some((t) => t.startsWith(w)))) found.push(d);
    }
    return found;
  }, [donors, query]);

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!suggestions.length) return;
      setOpen(true);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((a) => (a + step + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter') {
      if (open && suggestions[active]) {
        event.preventDefault();
        choose(suggestions[active]);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = open && query.trim() !== '';
  const breakdown = selected
    ? SUMMARY_GROUPS
      .map((group) => ({
        ...group,
        total: d3.sum(selected.gifts, (g) => (group.types.includes(g.type) ? g.amount : 0)),
      }))
      .filter((group) => group.total !== 0)
      .map((group) => `${formatDollars(group.total)} to ${group.label}`)
    : [];

  return (
    <figure
      ref={rootRef}
      style={{
        margin: '2rem 0',
        fontFamily: 'Georgia, serif',
        // Scrolling here from a ?donor= link stops below the site's fixed 50px top bar.
        scrollMarginTop: 66,
      }}
    >
      <h3 style={{ margin: '0 0 0.25rem' }}>Search UC employees’ contributions</h3>
      <p style={{ margin: '0 0 0.75rem', color: theme.palette.darkGrey }}>
        Type a name to see every contribution that donor made to federal candidates, PACs,
        party committees and joint fundraising committees.
      </p>
      <div style={{ position: 'relative' }}>
        <input
          type="search"
          value={query}
          placeholder="Search by name, e.g. Michael Cohen"
          role="combobox"
          aria-label="Donor name"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={LISTBOX_ID}
          aria-activedescendant={showList && suggestions[active] ? `${LISTBOX_ID}-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          onFocus={() => {
            load();
            setOpen(true);
          }}
          onBlur={() => setOpen(false)}
          onChange={(event) => {
            load();
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px 12px',
            fontSize: 17,
            fontFamily: 'inherit',
            border: `1px solid ${theme.palette.grey}`,
            borderRadius: 4,
            background: '#fff',
            color: theme.palette.black,
          }}
        />
        {showList && (
          <ul
            id={LISTBOX_ID}
            role="listbox"
            style={{
              position: 'absolute',
              zIndex: 2,
              left: 0,
              right: 0,
              margin: '2px 0 0',
              padding: 0,
              listStyle: 'none',
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: 4,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          >
            {!donors && <li style={{ ...cell, color: theme.palette.darkGrey }}>Loading names…</li>}
            {donors && !suggestions.length && (
              <li style={{ ...cell, color: theme.palette.darkGrey }}>No results</li>
            )}
            {suggestions.map((d, i) => (
              // The input handles the keyboard for the list (arrow keys and Enter).
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <li
                key={d.name}
                id={`${LISTBOX_ID}-${i}`}
                role="option"
                aria-selected={i === active}
                // Keep focus in the input so blur doesn't close the list before the click lands.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(d)}
                onMouseEnter={() => setActive(i)}
                style={{
                  ...cell,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  cursor: 'pointer',
                  background: i === active ? '#eef4fa' : '#fff',
                }}
              >
                <span>{d.label}</span>
                <span style={{ color: theme.palette.darkGrey, whiteSpace: 'nowrap' }}>
                  {formatDollars(d.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>{selected.label}</strong>
            {` gave ${formatDollars(selected.total)} in ${formatContributions(selected.count)}: `}
            {`${joinList(breakdown)}.`}
          </p>
          <div style={{
            maxHeight: 420, overflowY: 'auto', border: '1px solid #e3e3e3', borderRadius: 4,
          }}
          >
            <table style={{
              width: '100%', borderCollapse: 'collapse', fontSize: 15, background: '#fff',
            }}
            >
              <thead>
                <tr>
                  {['Date', 'Recipient', 'Amount'].map((h) => (
                    <th
                      key={h}
                      style={{
                        ...cell,
                        position: 'sticky',
                        top: 0,
                        background: '#f1f1f1',
                        textAlign: h === 'Amount' ? 'right' : 'left',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selected.gifts.map((g, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <tr key={i}>
                    <td style={{ ...cell, whiteSpace: 'nowrap' }}>{formatDate(g.date)}</td>
                    <td style={cell}>
                      {g.recipient}
                      <br />
                      <span style={{ fontSize: 13, color: theme.palette.darkGrey }}>
                        {recipientKind(g.type, g.state)}
                      </span>
                      {g.amount < 0 && (
                        <span style={{
                          marginLeft: 6,
                          padding: '1px 6px',
                          fontSize: 12,
                          borderRadius: 3,
                          background: '#f1f1f1',
                          border: '1px solid #ccc',
                          color: theme.palette.darkGrey,
                        }}
                        >
                          refund
                        </span>
                      )}
                    </td>
                    <td style={{ ...cell, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {formatDollars(g.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <figcaption style={{ fontSize: 14, color: theme.palette.darkGrey, marginTop: '0.75rem' }}>
        {/* Removed: an "About the data:" label, and these sentences: "...so employees who
            listed a different employer or none are missing, and a few donors may be
            misattributed. Employers that may or may not be part of UC, such as affiliated
            institutes and hospitals, are counted only when the donor lives in California. Donors
            are grouped by name exactly as reported: one person may appear under more than one
            spelling, and different people with the same name are combined." "Only contributions
            to candidates' campaign committees and to PACs are included, not money given to
            political parties or joint fundraising committees. Contributions sent through ActBlue
            or WinRed are listed under the campaign or PAC that received them, and refunds are
            shown as negative amounts." "...; the most recent months may be incomplete. A
            candidate's state is the state of the race, not the donor's." Also removed: "Federal
            law prohibits using contributor information from FEC reports to solicit
            contributions or for commercial purposes." */}
        <p style={{ margin: '0 0 0.5rem' }}>
          Donors are counted as UC employees based on the employer they reported to the FEC.
          Employees with the same name are reported as a single person here. Committees generally only itemize donors who give more than $200, so many smaller
          contributions are not in the data. Contributions are from the 2025–26 cycle as reported
          through September 2026.
        </p>
        Source: The Daily Californian; Federal Election Commission individual contributions,
        2025–26 cycle
      </figcaption>
    </figure>
  );
};

export default DonorSearch;
