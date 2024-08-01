import '../App.css';
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Legend, CartesianGrid, Tooltip,
} from 'recharts';
import { data as revenue } from '../data/revenue';
import { data as expenses } from '../data/expenses';

const colors = {
  football: '#e3565f', mbasket: '#b7823e', wbasket: '#8dccb1', msports: '#1a8b91', wsports: '#215675', np: '#a07fac',
};

function AreaCharts() {
  return (
    <div style={{
      display: 'block',
      marginTop: 'auto',
      left: '20px',
    }}
    >
      <div style={{
        flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}
      >
        <h3>Revenue over time, adjusted for inflation</h3>
        <ResponsiveContainer height={500}>
          <AreaChart
            width={500}
            height={250}
            data={revenue}
            margin={{
              top: 10, right: 0, left: 0, bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="football" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.football} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.football} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mensBasketball" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.mbasket} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.mbasket} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="womensBasketball" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.wbasket} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.wbasket} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="otherMens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.msports} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.msports} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="otherWomens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.wsports} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.wsports} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="nonprogram" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.np} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.np} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="Year" type="category" label={{ value: 'Year', position: 'insideBottom', offset: -10 }} />
            <YAxis label={{
              value: 'Amount ($M in 2024)', angle: -90, position: 'insideLeft', textAlign: 'center', offset: 15, dy: 80,
            }}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}M`} />
            <Legend wrapperStyle={{ bottom: -15 }} />
            <Area type="monotone" dataKey="Football" stroke={colors.football} fillOpacity={1} fill="url(#football)" />
            <Area type="monotone" dataKey="Men's Basketball" stroke={colors.mbasket} fillOpacity={1} fill="url(#mensBasketball)" />
            <Area type="monotone" dataKey="Women's Basketball" stroke={colors.wbasket} fillOpacity={1} fill="url(#womensBasketball)" />
            <Area type="monotone" dataKey="Other Men's Sports" stroke={colors.msports} fillOpacity={1} fill="url(#otherMens)" />
            <Area type="monotone" dataKey="Other Women's Sports" stroke={colors.wsports} fillOpacity={1} fill="url(#otherWomens)" />
            <Area type="monotone" dataKey="Non-Program Specific" stroke={colors.np} fillOpacity={1} fill="url(#nonprogram)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        flex: '1', alignItems: 'center', textAlign: 'center', marginTop: '30px',
      }}
      >
        <h3>Expenses over time, adjusted for inflation</h3>
        <ResponsiveContainer height={500}>
          <AreaChart
            width={500}
            height={250}
            data={expenses}
            margin={{
              top: 10, right: 0, left: 0, bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="football" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.football} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.football} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mensBasketball" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.mbasket} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.mbasket} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="womensBasketball" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.wbasket} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.wbasket} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="otherMens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.msports} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.msports} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="otherWomens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.wsports} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.wsports} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="nonprogram" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.np} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.np} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="Year" type="category" label={{ value: 'Year', position: 'insideBottom', offset: -10 }} />
            <YAxis label={{
              value: 'Amount ($M in 2024)', angle: -90, position: 'insideLeft', textAlign: 'center', offset: 15, dy: 80,
            }}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}M`} />
            <Legend wrapperStyle={{ bottom: -15 }} />
            <Area type="monotone" dataKey="Football" stroke={colors.football} fillOpacity={1} fill="url(#football)" />
            <Area type="monotone" dataKey="Men's Basketball" stroke={colors.mbasket} fillOpacity={1} fill="url(#mensBasketball)" />
            <Area type="monotone" dataKey="Women's Basketball" stroke={colors.wbasket} fillOpacity={1} fill="url(#womensBasketball)" />
            <Area type="monotone" dataKey="Other Men's Sports" stroke={colors.msports} fillOpacity={1} fill="url(#otherMens)" />
            <Area type="monotone" dataKey="Other Women's Sports" stroke={colors.wsports} fillOpacity={1} fill="url(#otherWomens)" />
            <Area type="monotone" dataKey="Non-Program Specific" stroke={colors.np} fillOpacity={1} fill="url(#nonprogram)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AreaCharts;
