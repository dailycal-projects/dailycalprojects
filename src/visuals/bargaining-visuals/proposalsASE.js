import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

const ProposalsASE = () => (

  <div>
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>Student work</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <ButtonGroup orientation="vertical" fullWidth>
            <Button href="https://dailycal.org" target="_blank" variant="outlined">
              Proposal 1, UC to UAW, Nov. 11
            </Button>
            <Button href="https://dailycal.org" target="_blank" variant="outlined">
              Proposal 2, UAW to UC, Nov. 11
            </Button>
            <Button href="https://dailycal.org" target="_blank" variant="outlined">
              Proposal 3, UC to UAW, Nov. 11
            </Button>
            <Button href="https://dailycal.org" target="_blank" variant="outlined">
              Proposal 4, UAW to UC, Nov. 11
            </Button>
            <Button href="https://dailycal.org" target="_blank" variant="outlined">
              Proposal 5, UC to UAW, Nov. 11
            </Button>
            <Button href="https://dailycal.org" target="_blank" variant="outlined">

              Proposal 6, UAW to UC, Nov. 11
            </Button>
            <Button href="https://dailycal.org" target="_blank" variant="outlined">
              Proposal 7, UC to UAW, Nov. 11

            </Button>
            <Button href="https://dailycal.org" target="_blank" variant="outlined">

              Proposal 8, UAW to UC, Nov. 11
            </Button>
            <Button href="https://dailycal.org" target="_blank" variant="outlined">
              Proposal 7, UC to UAW, Nov. 11

            </Button>
            <Button href="https://dailycal.org" target="_blank" variant="outlined">

              Proposal 8, UAW to UC, Nov. 11
            </Button>
          </ButtonGroup>
        </Typography>
      </AccordionDetails>
    </Accordion>
  </div>

);

export default ProposalsASE;
