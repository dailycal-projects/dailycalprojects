import { createMuiTheme } from "material-ui/core";

const greyShadow = '2px 2px 5px rgba(14, 20, 27, 0.15)'; 
const blueShadow = '2px 2px 5px #C5EAFC'; 

const theme = createMuiTheme({
    palette: {
        background: {
            main: '#F5F5F5'
        }, 
        white: {
            main: '#FFFFFF'
        }, 
        black: {
            main: '#0E141B'
        }, 
        dcalBlue: {
            main: '#0D96D8'
        }, 
        grey: {
            main: '#F7F7F7'
        },
        babyBlue: {
            main: 'C5EAFC'
        },
        orangeAccent: {
            main: 'FC9D5A'
        }
    }, 
    shadows: [greyShadow, blueShadow], 
    spacing: [0, 6, 12, 18, 24]
})

export default theme; 
