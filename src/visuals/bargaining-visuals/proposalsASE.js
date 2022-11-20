import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { articlesASE, infoASE } from './infoASE';

const ProposalsASE = () => (

  <div>
    {
        articlesASE.map((item) => (
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>{item}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <ButtonGroup orientation="vertical" fullWidth>
                  {
                        infoASE[item].map((proposal, index) => (

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
