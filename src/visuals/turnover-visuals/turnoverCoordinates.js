import { isNonNullChain } from "typescript"

export const turnoverCoordinates = {
    info: [

        {
            name: "A&W Restaurant",
            status: "Closed",
            approximateDate: "11/2020",
            address: "2996 Telegraph Avenue",
            coordinates: [37.856733277598124, -122.25983728206509],
            note: "Aliberto’s Jr. Mexican Food opened at this address in June 2022",
            color: "purple"
        },
        {
            name: "Bill's Men's Shop",
            status: "Closed",
            approximateDate: "10/2020",
            address: "2386 Telegraph Avenue",
            coordinates: [37.867315695262135, -122.25867562376372],
            note: "Sold and replaced by Beck's Shoes in 10/2020 due to business owner's retirement.",
            color: "red"
        },
        {
            name: "Boileroom",
            status: "Closed",
            approximateDate: "4/2020",
            address: "2475 Telegraph Avenue",
            coordinates: [37.865601617363396, -122.2582947500843],
            note: "Closed in support of California shelter-in-place order. Sizzling Lunch opened at this address in 2/2022.",
            color: "purple"
        },
        {
            name: "Buffalo Exchange",
            status: "Closed",
            approximateDate: "11/2020",
            address: "2585 Telegraph Avenue",
            coordinates: [37.86393422218963, -122.25803992191081],
            note: null,
            color: "red"
        },
        {
            name: "Daiso",
            status: "Closed",
            approximateDate: "6/2020",
            address: "2369 Telegraph Avenue",
            coordinates: [37.86755490392055, -122.25848213725511],
            note: "Mosaic Boulders opened at this address in 9/2022.",
            color: "purple"
        },
        {
            name: "Finfine",
            status: "Closed",
            approximateDate: "3/2020",
            address: "2556 Telegraph Avenue",
            coordinates: [37.8641396671781, -122.25894226246976],
            note: "Closed for shelter-in-place order and demolition of The Village mall. Business owners are looking to re-open in Berkeley.",
            color: "red"
        },
        {
            name: "J-Town Express",
            status: "Closed",
            approximateDate: "12/2020",
            address: "2332 Telegraph Avenue",
            coordinates: [37.8683409325918, -122.25872843169734],
            note: null,
            color: "red"
        },
        {
            name: "Sojo Ramen",
            status: "Closed",
            approximateDate: "2/2022",
            address: "2475 Telegraph Avenue",
            coordinates: [37.865601617363396, -122.2582947500843],
            note: null,
            color: "red"
        },
        {
            name: "Tako Sushi",
            status: "Closed",
            approximateDate: "5/2022",
            address: "2379 Telegraph Avenue",
            coordinates: [37.867387025406536, -122.25844145259931],
            note: null,
            color: "red"
        },
        {
            name: "Enedina Taqueria",
            status: "Closed",
            approximateDate: "6/2021",
            address: "3001 Telegraph Avenue",
            coordinates: [37.855895645218915, -122.2593851832884],
            note: null,
            color: "red"
        },
        {
            name: "So-so Supermarket",
            status: "Closed",
            approximateDate: "12/2021",
            address: "2333 Telegraph Avenue",
            coordinates: [37.86833183653382, -122.25845178143547],
            note: "Ran as a three-month-long pop up shop between September 2021 and December 2021",
            color: "red"
        },
        {
            name: "Pappy's",
            status: "Closed",
            approximateDate: "3/2022",
            address: "2367 Telegraph Avenue",
            coordinates: [37.867525167145544, -122.25874111775073],
            note: null,
            color: "red"
        },
        {
            name: "Delhi Diner",
            status: "Opened",
            approximateDate: "6/2020",
            address: "2400 Telegraph Avenue",
            coordinates: [37.86680686504661, -122.2589128022855],
            note: null,
            color: "green"
        },
        {
            name: "Diffusion Studios",
            status: "Opened",
            approximateDate: "9/2021",
            address: "2315 Telegraph Avenue",
            coordinates: [37.868334749642386, -122.25897193555352],
            note: null,
            color: "green"
        },
        {
            name: "Duffl",
            status: "Opened",
            approximateDate: "9/2021",
            address: "2595 Telegraph Avenue",
            coordinates: [37.8635543401126, -122.25840979908618],
            note: null,
            color: "green"
        },
        {
            name: "Kuboba Spot",
            status: "Opened",
            approximateDate: "7/2022",
            address: "2618 Telegraph Avenue",
            coordinates: [37.86260092975001, -122.25903709983461],
            note: null,
            color: "green"
        },
        {
            name: "Sharetea",
            status: "Opened",
            approximateDate: "10/2021",
            address: "2328 Telegraph Avenue",
            coordinates: [37.868153829116096, -122.2592922999867],
            note: null,
            color: "green"
        },
        {
            name: "Sharetea",
            status: "Opened",
            approximateDate: "10/2021",
            address: "2328 Telegraph Avenue",
            coordinates: [37.86816229873032, -122.25929229972847],
            note: null,
            color: "green"
        },
        {
            name: "The Apothecarium",
            status: "Opened",
            approximateDate: "7/2020",
            address: "2312 Telegraph Avenue",
            coordinates: [37.86828126852266, -122.25934432821737],
            note: null,
            color: "green"
        },
        {
            name: "The Ink Stone",
            status: "Opened",
            approximateDate: "6/2020",
            address: "2424 Telegraph Avenue",
            coordinates: [37.86652586892029, -122.25889479933339],
            note: "Moved from 2302 Bowditch Street.",
            color: "green"
        },
        {
            name: "The Line Coffee",
            status: "Opened",
            approximateDate: "4/2022",
            address: "3001 Telegraph Avenue",
            coordinates: [37.855931730318865, -122.2593849709788],
            note: null,
            color: "green"
        },
        {
            name: "The Line Coffee",
            status: "Opened",
            approximateDate: "4/2022",
            address: "3001 Telegraph Avenue",
            coordinates: [37.855931730318865, -122.2593849709788],
            note: null,
            color: "green"
        },
        
    ],
    minLat: 37.856888564930244,
    maxLat: 37.86763259068802,
    minLong: -122.26692349096834,
    maxLong: -122.24801314287727,
  };
  