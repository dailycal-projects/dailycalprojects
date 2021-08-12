import React from 'react';
import { useTable, useFilters } from 'react-table';
import MaterialTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { allData } from './tabledata.js';
import '../../styles/olympicsTable.css';

function TextFilter({ column: { filterValue, setFilter } }) {
  return (
    <TextField
      value={filterValue || ''}
      onChange={(e) => setFilter(e.target.value || undefined)}
    />
  );
}
// This is a custom filter UI for selecting
// a unique option from a list
function SelectColumnFilter({
  column: {
    filterValue, setFilter, preFilteredRows, id,
  },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...Array.from(options.values()).sort()];
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <Select
      value={filterValue || ''}
      displayEmpty
      onChange={(e) => setFilter(e.target.value || '')}
    >
      <MenuItem value="">All</MenuItem>
      {options.map((option, i) => (
        <MenuItem key={i} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  );
}

// Our table component
function Table({ columns, data }) {
  const filterTypes = React.useMemo(
    () => ({
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => rows.filter((row) => {
        const rowValue = row.values[id];
        return rowValue !== undefined
          ? String(rowValue)
            .toLowerCase()
            .startsWith(String(filterValue).toLowerCase())
          : true;
      }),
    }),
    [],
  );

  const defaultColumn = React.useMemo(() => ({}), []);

  const { headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      defaultColumn, // Be sure to pass the defaultColumn option
      filterTypes,
    },
    useFilters, // useFilters!
  );

  // We don't want to render all of the rows for this example, so cap
  // it for this use case
  const firstPageRows = rows.slice(0, 10);

  return (
    <TableContainer component={Paper} style={{ padding: '10px' }}>
      <MaterialTable>
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <>
              <TableRow>
                {headerGroup.headers.map((column) => (
                  <TableCell>{column.render('Header')}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                {headerGroup.headers.map((column) => (
                  <TableCell>
                    <div>{column.canFilter && column.render('Filter')}</div>
                  </TableCell>
                ))}
              </TableRow>
            </>
          ))}
        </TableHead>
        <TableBody>
          {firstPageRows.map((row) => {
            prepareRow(row);
            return (
              <TableRow>
                {row.cells.map((cell) => (
                  <TableCell>{cell.render('Cell')}</TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </MaterialTable>
    </TableContainer>
  );
}

// Define a custom filter filter function!
function filterGreaterThan(rows, id, filterValue) {
  return rows.filter((row) => {
    const rowValue = row.values[id];
    return rowValue >= filterValue;
  });
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = (val) => typeof val !== 'number';

function OlympicsTable() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'Name',
        Filter: TextFilter,
        filter: 'includes',
      },
      {
        Header: 'Country',
        accessor: 'Country',
        Filter: SelectColumnFilter,
        filter: 'includes',
      },
      {
        Header: 'Sport',
        accessor: 'Sport',
        Filter: SelectColumnFilter,
        filter: 'includes',
      },
      {
        Header: 'Event',
        accessor: 'Event',
        Filter: SelectColumnFilter,
        filter: 'includes',
      },
      {
        Header: 'Olympic Year',
        accessor: 'Olympic Year',
        Filter: SelectColumnFilter,
        filter: 'includes',
      },
      {
        Header: 'Result',
        accessor: 'Result',
        Filter: SelectColumnFilter,
        filter: 'includes',
      },
    ],
    [],
  );
  return <Table columns={columns} data={allData} />;
}

export default OlympicsTable;
