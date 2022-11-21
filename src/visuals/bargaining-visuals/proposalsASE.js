import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { lastUpdated, articlesASE, infoASE } from './infoASE';

const ProposalsASE = () => (
  <div>
    <p>
      <i>
        {lastUpdated}
      </i>
    </p>
    {
        articlesASE.map((item) => (
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography><i>{item}</i></Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {infoASE[item].intro}
                <br />
                <br />
                <ButtonGroup orientation="vertical" fullWidth>
                  {
                        infoASE[item].proposals.map((proposal) => (
                          <Button href={proposal.link} color={proposal.color} target="_blank" variant="outlined">
                            {proposal.name}
                          </Button>
                        ))
                    }
                </ButtonGroup>
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))
}
  </div>
);

export default ProposalsASE;
