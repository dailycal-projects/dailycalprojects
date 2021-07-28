import React, { Component } from 'react';
import { Treemap } from 'react-vis';
import {
  Label,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  CartesianGrid,
  Bar,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import '../styles/olympicsTheme.css';

const allData = [
  {
    Name: 'Shareef Abdur-Rahim',
    Sport: "Men's Basketball",
    'Olympic Year': 2000,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Nathan Adrian',
    Sport: "Men's Swimming",
    'Olympic Year': 2008,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Nathan Adrian',
    Sport: "Men's Swimming",
    'Olympic Year': 2012,
    Bronze: 0,
    Gold: 1,
    Silver: 1,
    Medals: 2,
  },
  {
    Name: 'Nathan Adrian',
    Sport: "Men's Swimming",
    'Olympic Year': 2016,
    Bronze: 2,
    Gold: 2,
    Silver: 0,
    Medals: 4,
  },
  {
    Name: 'George Ahlgren',
    Sport: "Men's Crew",
    'Olympic Year': 1948,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Par Arvidsson',
    Sport: "Men's Swimming",
    'Olympic Year': 1980,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Peter Asch',
    Sport: "Men's Water Polo",
    'Olympic Year': 1972,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Kathleen Baker',
    Sport: "Women's Swimming",
    'Olympic Year': 2016,
    Bronze: 0,
    Gold: 1,
    Silver: 1,
    Medals: 2,
  },
  {
    Name: 'Begnt Baron',
    Sport: "Men's Swimming",
    'Olympic Year': 1980,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Begnt Baron',
    Sport: "Men's Swimming",
    'Olympic Year': 1984,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Sebastian Bea',
    Sport: "Men's Crew",
    'Olympic Year': 2000,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Matt Biondi',
    Sport: "Men's Swimming",
    'Olympic Year': 1984,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Matt Biondi',
    Sport: "Men's Swimming",
    'Olympic Year': 1988,
    Bronze: 1,
    Gold: 5,
    Silver: 1,
    Medals: 7,
  },
  {
    Name: 'Matt Biondi',
    Sport: "Men's Swimming",
    'Olympic Year': 1992,
    Bronze: 1,
    Gold: 2,
    Silver: 1,
    Medals: 4,
  },
  {
    Name: 'James Blair',
    Sport: "Men's Crew",
    'Olympic Year': 1932,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Donald Blessing',
    Sport: "Men's Crew",
    'Olympic Year': 1928,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Rachel Bootsma',
    Sport: "Women's Swimming",
    'Olympic Year': 2012,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Gillian Boxx',
    Sport: 'Softball',
    'Olympic Year': 1996,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'John M. Brinck',
    Sport: "Men's Crew",
    'Olympic Year': 1928,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'David Brown',
    Sport: "Men's Crew",
    'Olympic Year': 1948,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Lloyd Butler',
    Sport: "Men's Crew",
    'Olympic Year': 1948,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Erin Cafaro',
    Sport: "Women's Crew",
    'Olympic Year': 2008,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Erin Cafaro',
    Sport: "Women's Rowing",
    'Olympic Year': 2012,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Herbert Caldwell',
    Sport: "Men's Crew",
    'Olympic Year': 1928,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Milorad Cavic',
    Sport: "Men's Swimming",
    'Olympic Year': 2008,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Charles Chandler',
    Sport: "Men's Crew",
    'Olympic Year': 1932,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Brandi Chastain',
    Sport: "Women's Soccer",
    'Olympic Year': 1996,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Brandi Chastain',
    Sport: "Women's Soccer",
    'Olympic Year': 2000,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Pete Cipollone',
    Sport: "Men's Crew",
    'Olympic Year': 2004,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Bob Clark',
    Sport: "Men's Track & Field",
    'Olympic Year': 1936,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Natalie Coughlin',
    Sport: "Women's Swimming",
    'Olympic Year': 2004,
    Bronze: 1,
    Gold: 2,
    Silver: 2,
    Medals: 5,
  },
  {
    Name: 'Natalie Coughlin',
    Sport: "Women's Swimming",
    'Olympic Year': 2008,
    Bronze: 3,
    Gold: 1,
    Silver: 2,
    Medals: 6,
  },
  {
    Name: 'Natalie Coughlin',
    Sport: "Women's Swimming",
    'Olympic Year': 2012,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Tammy Crow',
    Sport: 'Synch. Swimming',
    'Olympic Year': 2004,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Ann Curtis Cuneo',
    Sport: "Women's Swimming",
    'Olympic Year': 1948,
    Bronze: 0,
    Gold: 2,
    Silver: 1,
    Medals: 3,
  },
  {
    Name: 'William Dally',
    Sport: "Men's Crew",
    'Olympic Year': 1928,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'George Davis',
    Sport: 'Rugby',
    'Olympic Year': 1920,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Megan Dirkmaat',
    Sport: "Women's Crew",
    'Olympic Year': 2004,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'George Dixon',
    Sport: 'Rugby',
    'Olympic Year': 1924,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Peter Donlon',
    Sport: "Men's Crew",
    'Olympic Year': 1928,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Duje Draganja',
    Sport: "Men's Swimming",
    'Olympic Year': 2004,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Dave Dunlap',
    Sport: "Men's Crew",
    'Olympic Year': 1932,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Phillip Durbrow',
    Sport: "Men's Crew",
    'Olympic Year': 1964,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Ky Ebright',
    Sport: "Men's Crew",
    'Olympic Year': 1928,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Ky Ebright',
    Sport: "Men's Crew",
    'Olympic Year': 1932,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Ky Ebright',
    Sport: "Men's Crew",
    'Olympic Year': 1948,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Anthony Ervin',
    Sport: "Men's Swimming",
    'Olympic Year': 2000,
    Bronze: 0,
    Gold: 1,
    Silver: 1,
    Medals: 2,
  },
  {
    Name: 'Anthony Ervin',
    Sport: "Men's Swimming",
    'Olympic Year': 2016,
    Bronze: 0,
    Gold: 2,
    Silver: 0,
    Medals: 2,
  },
  {
    Name: 'Joy (Biefeld) Fawcett',
    Sport: "Women's Soccer",
    'Olympic Year': 1996,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Joy (Biefeld) Fawcett',
    Sport: "Women's Soccer",
    'Olympic Year': 2000,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Joy (Biefeld) Fawcett',
    Sport: "Women's Soccer",
    'Olympic Year': 2004,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'George Fish',
    Sport: 'Rugby',
    'Olympic Year': 1920,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Scott Frandsen',
    Sport: "Men's Crew",
    'Olympic Year': 2008,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Missy Franklin',
    Sport: "Women's Swimming",
    'Olympic Year': 2012,
    Bronze: 1,
    Gold: 4,
    Silver: 0,
    Medals: 5,
  },
  {
    Name: 'Missy Franklin',
    Sport: "Women's Swimming",
    'Olympic Year': 2016,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Francis Frederick',
    Sport: "Men's Crew",
    'Olympic Year': 1928,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Vicky Galindo',
    Sport: 'Softball',
    'Olympic Year': 2008,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Sue Gossick',
    Sport: "Women's Diving",
    'Olympic Year': 1968,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Ed "Mush" Graff',
    Sport: 'Rugby',
    'Olympic Year': 1924,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Norris Graham',
    Sport: "Men's Crew",
    'Olympic Year': 1932,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Michelle Granger',
    Sport: 'Softball',
    'Olympic Year': 1996,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Duncan Gregg',
    Sport: "Men's Crew",
    'Olympic Year': 1932,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Winslow Hall',
    Sport: "Men's Crew",
    'Olympic Year': 1932,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Brutus Hamilton',
    Sport: "Men's Track & Field",
    'Olympic Year': 1920,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Jessica Hardy',
    Sport: "Women's Swimming",
    'Olympic Year': 2012,
    Bronze: 1,
    Gold: 1,
    Silver: 0,
    Medals: 2,
  },
  {
    Name: 'Jim Hardy',
    Sport: "Men's Crew",
    'Olympic Year': 1948,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Eddie Hart',
    Sport: "Men's Track & Field",
    'Olympic Year': 1972,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Mary Harvey',
    Sport: "Women's Soccer",
    'Olympic Year': 1996,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'John Hazeltine',
    Sport: 'Rugby',
    'Olympic Year': 1920,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Mark Henderson',
    Sport: "Men's Swimming",
    'Olympic Year': 1996,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Pelle Holmertz',
    Sport: "Men's Swimming",
    'Olympic Year': 1980,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Chris Huffins',
    Sport: "Men's Track & Field",
    'Olympic Year': 2000,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Darrall Imhoff',
    Sport: "Men's Basketball",
    'Olympic Year': 1960,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Sara Isakovic',
    Sport: "Women's Swimming",
    'Olympic Year': 2008,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Scott Jaffe',
    Sport: "Men's Swimming",
    'Olympic Year': 1992,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Helen Jameson',
    Sport: "Women's Swimming",
    'Olympic Year': 1980,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Burton Jastram',
    Sport: "Men's Crew",
    'Olympic Year': 1932,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Courtney Johnson',
    Sport: "Women's Water Polo",
    'Olympic Year': 2000,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Sheryl Johnson',
    Sport: 'Field Hockey',
    'Olympic Year': 1984,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Jason Kidd',
    Sport: "Men's Basketball",
    'Olympic Year': 2000,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Jason Kidd',
    Sport: "Men's Basketball",
    'Olympic Year': 2008,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Bob Kiesel',
    Sport: "Men's Track & Field",
    'Olympic Year': 1932,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Leamon King',
    Sport: "Men's Track & Field",
    'Olympic Year': 1956,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Paul Kingsman',
    Sport: "Men's Swimming",
    'Olympic Year': 1988,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Kara Kohler',
    Sport: "Women's Rowing",
    'Olympic Year': 2012,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Laurel Korholz',
    Sport: "Women's Rowing",
    'Olympic Year': 2004,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Oleg Kossiack',
    Sport: "Men's Gymnastics",
    'Olympic Year': 1996,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Ludy Langer',
    Sport: "Men's Swimming",
    'Olympic Year': 1920,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Thomas Lejdstrom',
    Sport: "Men's Swimming",
    'Olympic Year': 1984,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Catilin Leverenz',
    Sport: "Women's Swimming",
    'Olympic Year': 2012,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Harry Liversedge',
    Sport: "Men's Track & Field",
    'Olympic Year': 1920,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Carli Lloyd',
    Sport: "Women's Volleyball",
    'Olympic Year': 2012,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Carli Lloyd',
    Sport: "Women's Volleyball",
    'Olympic Year': 2016,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Ericka Lorenz',
    Sport: "Women's Water Polo",
    'Olympic Year': 2000,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Ericka Lorenz',
    Sport: "Women's Water Polo",
    'Olympic Year': 2004,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Agneta Martensson',
    Sport: "Women's Swimming",
    'Olympic Year': 1980,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Holly McPeak',
    Sport: "Women's Beach Volleyball",
    'Olympic Year': 2004,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Mary T. Meagher',
    Sport: "Women's Swimming",
    'Olympic Year': 1984,
    Bronze: 0,
    Gold: 3,
    Silver: 0,
    Medals: 3,
  },
  {
    Name: 'Mary T. Meagher',
    Sport: "Women's Swimming",
    'Olympic Year': 1988,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Charles Meehan',
    Sport: 'Rugby',
    'Olympic Year': 1920,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'George D. Mitchell',
    Sport: "Men's Water Polo",
    'Olympic Year': 1924,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Alex Morgan',
    Sport: "Women's Soccer",
    'Olympic Year': 2012,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Jonny Mosely',
    Sport: "Men's Freestyle Skiing",
    'Olympic Year': 1998,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Harold "Brick" Muller',
    Sport: "Men's Track & Field",
    'Olympic Year': 1920,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Ryan Murphy',
    Sport: "Men's Swimming",
    'Olympic Year': 2016,
    Bronze: 0,
    Gold: 3,
    Silver: 0,
    Medals: 3,
  },
  {
    Name: 'John Mykkanen',
    Sport: "Men's Swimming",
    'Olympic Year': 1984,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Ed Nemir',
    Sport: "Men's Wrestling",
    'Olympic Year': 1932,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Pete Newell',
    Sport: "Men's Basketball",
    'Olympic Year': 1960,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Lowell North',
    Sport: 'Yachting',
    'Olympic Year': 1964,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Lowell North',
    Sport: 'Yachting',
    'Olympic Year': 1968,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: "Maureen O'Toole",
    Sport: "Women's Water Polo",
    'Olympic Year': 2000,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Heather Petri',
    Sport: "Women's Water Polo",
    'Olympic Year': 2000,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Heather Petri',
    Sport: "Women's Water Polo",
    'Olympic Year': 2004,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Heather Petri',
    Sport: "Women's Water Polo",
    'Olympic Year': 2008,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Heather Petri',
    Sport: "Women's Water Polo",
    'Olympic Year': 2012,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Connie Carpenter Phinney',
    Sport: "Women's Cycling",
    'Olympic Year': 1984,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Marcy Place',
    Sport: 'Field Hockey',
    'Olympic Year': 1984,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Augustus Pope',
    Sport: "Men's Track & Field",
    'Olympic Year': 1920,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Josh Prenot',
    Sport: "Men's Swimming",
    'Olympic Year': 2016,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Ralph Purchase',
    Sport: "Men's Crew",
    'Olympic Year': 1948,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Kevin Robertson',
    Sport: "Men's Water Polo",
    'Olympic Year': 1984,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Kevin Robertson',
    Sport: "Men's Water Polo",
    'Olympic Year': 1988,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Peter Rocca',
    Sport: "Men's Swimming",
    'Olympic Year': 1976,
    Bronze: 0,
    Gold: 0,
    Silver: 2,
    Medals: 2,
  },
  {
    Name: 'Edwin Salisbury',
    Sport: "Men's Crew",
    'Olympic Year': 1932,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Aleksa Saponjic',
    Sport: "Men's Water Polo",
    'Olympic Year': 2012,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Jill Savery',
    Sport: 'Synch. Swimming',
    'Olympic Year': 1996,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'George Schroth',
    Sport: "Men's Water Polo",
    'Olympic Year': 1924,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Tom Shields',
    Sport: "Men's Swimming",
    'Olympic Year': 2016,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Olivier Siegelaar',
    Sport: "Men's Rowing",
    'Olympic Year': 2016,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Emily Silver',
    Sport: "Women's Swimming",
    'Olympic Year': 2008,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Colby Slater',
    Sport: 'Rugby',
    'Olympic Year': 1920,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Colby Slater',
    Sport: 'Rugby',
    'Olympic Year': 1924,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Graham Smith',
    Sport: "Men's Swimming",
    'Olympic Year': 1976,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Guinn Smith',
    Sport: "Men's Track & Field",
    'Olympic Year': 1948,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Joe Smith',
    Sport: "Men's Track & Field",
    'Olympic Year': 1988,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Justus Smith',
    Sport: "Men's Crew",
    'Olympic Year': 1948,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'John Stack',
    Sport: "Men's Crew",
    'Olympic Year': 1948,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Martin F. Stalder',
    Sport: "Men's Crew",
    'Olympic Year': 1928,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Dave Steen',
    Sport: "Men's Track & Field",
    'Olympic Year': 1988,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Staciana Stitts',
    Sport: "Women's Swimming",
    'Olympic Year': 2000,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Jon Svendsen',
    Sport: "Men's Water Polo",
    'Olympic Year': 1984,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Roser Taraggo',
    Sport: "Women's Water Polo",
    'Olympic Year': 2012,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Margot Thien',
    Sport: 'Synch. Swimming',
    'Olympic Year': 1996,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Joel Thomas',
    Sport: "Men's Swimming",
    'Olympic Year': 1992,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'William Thompson',
    Sport: "Men's Crew",
    'Olympic Year': 1928,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Charles Tilden',
    Sport: 'Rugby',
    'Olympic Year': 1920,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Harold Tower',
    Sport: "Men's Crew",
    'Olympic Year': 1932,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Nion Tucker',
    Sport: "Men's Bobsled",
    'Olympic Year': 1928,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Ed Turkington',
    Sport: 'Rugby',
    'Olympic Year': 1924,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'David Turner',
    Sport: "Men's Crew",
    'Olympic Year': 1948,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Ian Turner',
    Sport: "Men's Crew",
    'Olympic Year': 1948,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Conny van Bentum',
    Sport: "Women's Swimming",
    'Olympic Year': 1980,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Conny van Bentum',
    Sport: "Women's Swimming",
    'Olympic Year': 1984,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Conny van Bentum',
    Sport: "Women's Swimming",
    'Olympic Year': 1988,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Dana Vollmer',
    Sport: "Women's Swimming",
    'Olympic Year': 2004,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Dana Vollmer',
    Sport: "Women's Swimming",
    'Olympic Year': 2012,
    Bronze: 0,
    Gold: 3,
    Silver: 0,
    Medals: 3,
  },
  {
    Name: 'Dana Vollmer',
    Sport: "Women's Swimming",
    'Olympic Year': 2016,
    Bronze: 1,
    Gold: 1,
    Silver: 1,
    Medals: 3,
  },
  {
    Name: 'Abbey Weitzeil',
    Sport: "Women's Swimming",
    'Olympic Year': 2016,
    Bronze: 0,
    Gold: 1,
    Silver: 1,
    Medals: 2,
  },
  {
    Name: 'Barry Weitzenberg',
    Sport: "Men's Water Polo",
    'Olympic Year': 1972,
    Bronze: 1,
    Gold: 0,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Tom Werner',
    Sport: "Men's Swimming",
    'Olympic Year': 1992,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Jake Wetzel',
    Sport: "Men's Crew",
    'Olympic Year': 2004,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Jake Wetzel',
    Sport: "Men's Crew",
    'Olympic Year': 2008,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Hazel Hotchkiss Wightman',
    Sport: "Women's Tennis",
    'Olympic Year': 1924,
    Bronze: 0,
    Gold: 2,
    Silver: 0,
    Medals: 2,
  },
  {
    Name: 'Archie Williams',
    Sport: "Men's Track & Field",
    'Olympic Year': 1936,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Norris Williams',
    Sport: "Men's Tennis",
    'Olympic Year': 1924,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Helen Wills',
    Sport: "Women's Tennis",
    'Olympic Year': 1924,
    Bronze: 0,
    Gold: 2,
    Silver: 0,
    Medals: 2,
  },
  {
    Name: 'Dave Wilson',
    Sport: "Men's Swimming",
    'Olympic Year': 1984,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Elsie Windes',
    Sport: "Women's Water Polo",
    'Olympic Year': 2008,
    Bronze: 0,
    Gold: 0,
    Silver: 1,
    Medals: 1,
  },
  {
    Name: 'Elsie Windes',
    Sport: "Women's Water Polo",
    'Olympic Year': 2012,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'James Winston',
    Sport: 'Rugby',
    'Olympic Year': 1920,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'James Workman',
    Sport: "Men's Crew",
    'Olympic Year': 1928,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
  {
    Name: 'Jack Yerman',
    Sport: "Men's Track & Field",
    'Olympic Year': 1960,
    Bronze: 0,
    Gold: 1,
    Silver: 0,
    Medals: 1,
  },
];

class OlympicsChart extends Component {
  // Set initial state
  constructor(props) {
    super(props);
    this.state = {
      sport: null,
      viewSport: null,
      left: 1924,
      right: 2016,
    };
  }

  zoom() {
    let { refAreaLeft, refAreaRight } = this.state;
    if (
      refAreaLeft === refAreaRight
      || refAreaLeft == null
      || (refAreaRight == null) | (refAreaRight === '')
    ) {
      this.zoomOut();
      return;
    }

    // xAxis domain
    if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];
    this.setState(() => ({
      refAreaLeft: '',
      refAreaRight: '',
      left: refAreaLeft,
      right: refAreaRight,
    }));
  }

  zoomOut() {
    this.setState(() => ({
      refAreaLeft: '',
      refAreaRight: '',
      left: 1924,
      right: 2016,
    }));
  }

  // Method to update sport
  updateSport(d) {
    if (d.data.title === this.state.sport) {
      this.setState({
        sport: null,
      });
    } else {
      this.setState({
        sport: d.data.title,
      });
    }
  }

  viewSport(d) {
    this.setState({
      viewSport: d.data.title,
    });
  }

  // Render Method
  render() {
    const {
      left, right, refAreaLeft, refAreaRight,
    } = this.state;

    const timeFrameData = allData.filter((d) => d['Olympic Year'] >= left && d['Olympic Year'] <= right);

    // Aggregate per year
    const byYear = {};
    timeFrameData.forEach((d) => {
      if ((this.state.sport === null || d.Sport === this.state.sport)) {
        if (byYear[d['Olympic Year']] === undefined) {
          byYear[d['Olympic Year']] = {
            Gold: 0,
            Silver: 0,
            Bronze: 0,
            Medals: 0,
          };
        }
        byYear[d['Olympic Year']].Gold += d.Gold;
        byYear[d['Olympic Year']].Silver += d.Silver;
        byYear[d['Olympic Year']].Bronze += d.Bronze;
        byYear[d['Olympic Year']].Medals += d.Gold + d.Silver + d.Bronze;
      }
    });
    const yearData = [];
    Object.keys(byYear).forEach((d) => {
      yearData.push({
        Year: d,
        Gold: byYear[d].Gold,
        Silver: byYear[d].Silver,
        Bronze: byYear[d].Bronze,
        Medals: byYear[d].Medals,
      });
    });

    // Aggregate across time
    const byAthlete = {};
    timeFrameData.forEach((d) => {
      if (byAthlete[d.Name] === undefined) {
        byAthlete[d.Name] = {
          Sport: d.Sport,
          Gold: 0,
          Silver: 0,
          Bronze: 0,
        };
      }
      byAthlete[d.Name].Gold += d.Gold;
      byAthlete[d.Name].Silver += d.Silver;
      byAthlete[d.Name].Bronze += d.Bronze;
    });

    const athleteData = [];
    Object.keys(byAthlete).forEach((d) => {
      athleteData.push({
        Name: d,
        Sport: byAthlete[d].Sport,
        Gold: byAthlete[d].Gold,
        Silver: byAthlete[d].Silver,
        Bronze: byAthlete[d].Bronze,
      });
    });

    // Treemap Data
    const bySport = {};
    athleteData.forEach((d) => {
      if (this.state.sport === null || d.Sport === this.state.sport) {
        if (bySport[d.Sport] === undefined) {
          bySport[d.Sport] = 0;
        }
        bySport[d.Sport] += d.Gold + d.Silver + d.Bronze;
      }
    });
    const treeData = [];
    Object.keys(bySport).forEach((d) => treeData.push({
      title: d,
      size: bySport[d],
      style: {
        border: '1px solid white',
      },
    }));

    const targetSport = this.state.viewSport === null ? this.state.sport : this.state.viewSport;

    const filteredData = athleteData
      .filter((d) => {
        if (targetSport === null) return true;
        return d.Sport === targetSport;
      })
      .sort((a, b) => (
        3 * b.Gold
          - 3 * a.Gold
          + 2 * b.Silver
          - 2 * a.Silver
          + b.Bronze
          - a.Bronze
      ))
      .filter((d, i) => i < 10);

    // Sizes
    const height = window.innerHeight - 150;
    const demoninator = window.innerWidth < 800 ? 1 : 2.2;
    const width = document.querySelector('.container') === null
      ? 1000
      : Math.floor(
        document.querySelector('.container').offsetWidth / demoninator,
      );

    const sportText = `Top Medalists ${
      this.state.sport === null ? '(All Sports)' : `(${this.state.sport})`}`;
    // Return DOM elements
    return (
      <div className="OlympicsChart">
        <div className="container">
          <h1>Cal Olympics Medalists</h1>
        </div>

        <div className="container">

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              width={800}
              height={400}
              data={yearData}
              onMouseDown={(e) => this.setState({
                refAreaLeft: e === null ? null : e.activeLabel,
              })}
              onMouseMove={(e) => this.state.refAreaLeft
                && this.setState({ refAreaRight: e.activeLabel })}
              // eslint-disable-next-line react/jsx-no-bind
              onMouseUp={this.zoom.bind(this)}
              margin={{
                top: 5, right: 30, left: 30, bottom: 40,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="Year"
                domain={[left - 2, right + 2]}
              >
                <Label
                  value="Medals by Year"
                  position="bottom"
                />
              </XAxis>
              <YAxis type="number" />
              <Tooltip />
              <Bar dataKey="Bronze" fill="#cd7f32" stackId="a" />
              <Bar dataKey="Silver" fill="#c0c0c0" stackId="a" />
              <Bar dataKey="Gold" fill="#FFD700" stackId="a" />

              {refAreaLeft && refAreaRight ? (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  strokeOpacity={0.3}
                />
              ) : null}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="container">
          <BarChart
            className="chart"
            layout="vertical"
            width={width}
            height={height}
            data={filteredData}
            margin={{
              top: 5, right: 30, left: 100, bottom: 15,
            }}
          >
            <XAxis type="number">
              <Label value={sportText} offset={-10} position="insideBottom" />
            </XAxis>
            <YAxis type="category" dataKey="Name" />
            <Tooltip />
            <Bar dataKey="Bronze" fill="#cd7f32" stackId="a" />

            <Bar dataKey="Silver" fill="#c0c0c0" stackId="a" />
            <Bar dataKey="Gold" fill="#FFD700" stackId="a" />
          </BarChart>

          <div className="chart">
            <Treemap
              color="rgb(0, 59, 98)"
              animation
              onLeafMouseOut={() => this.setState({
                viewSport: null,
              })}
              onLeafMouseOver={this.viewSport.bind(this)}
              onLeafClick={this.updateSport.bind(this)}
              hideRootNode
              data={{ children: treeData }}
              dataKey="size"
              height={height}
              width={width}
            />
            <span className="treemapLabel">Medalists by Sport</span>
          </div>
        </div>
      </div>
    );
  }
}

// Export component for rendering
export default OlympicsChart;
