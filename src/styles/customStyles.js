import { createStyles } from '@material-ui/core';

export const styles = () => 
    createStyles({
        main: {
            display: 'flex',
            flexDirection: 'column',
            margin: '3rem', 
        },
        header: {
            display: 'flex', 
            flexDirection: 'row-reverse'
        },
        navBar: {
            display: 'flex', 
            flexDirection: 'column',
        }
    }); 