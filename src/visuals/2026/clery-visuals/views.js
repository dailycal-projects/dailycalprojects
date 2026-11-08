export function viewHref(view, params = {}) {
  const search = new URLSearchParams(params);
  if (view !== 'story') search.set('view', view);
  const query = search.toString();
  return query ? `?${query}` : '?';
}

export function routeFromUrl() {
  const search = new URLSearchParams(window.location.search);
  const requested = search.get('view');
  return {
    view: ['dashboard', 'table'].includes(requested) ? requested : 'story',
    caseNumber: search.get('case') || '',
  };
}
