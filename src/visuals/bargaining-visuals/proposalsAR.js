import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { articlesAR, infoAR } from './infoAR';
import ColorMap from './bargainingColorMap';
import NumberMap from './bargainingNumberMap';

const accordionColors = new Map();
let tentativeAgreements = 0;

articlesAR.map((item) => (

  infoAR[item].proposals.map((proposal) => (

    accordionColors.set(item, ColorMap.get(proposal.color)),
    tentativeAgreements += NumberMap.get(proposal.color)

  ))
));

const ProposalsAR = () => (
  <div>
    {
          articlesAR.map((item) => (
            <Accordion sx={{
              backgroundColor: accordionColors.get(item),
            }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography><i>{item}</i></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {infoAR[item].intro}
                  <br />
                  <br />
                  <ButtonGroup orientation="vertical" fullWidth>
                    {
                          infoAR[item].proposals.map((proposal) => (
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

export default ProposalsAR;
