import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";
import React from "react";
import ColorMap from "./bargainingColorMap";
import NumberMap from "./bargainingNumberMap";
import { lastUpdated, articlesSR, infoSR } from "./infoSR";

const accordionColors = new Map();
let tentativeAgreements = 0;

articlesSR.map((item) =>
  infoSR[item].proposals.map(
    (proposal) => (
      accordionColors.set(item, ColorMap.get(proposal.color)),
      (tentativeAgreements += NumberMap.get(proposal.color))
    )
  )
);

const ProposalsSR = () => (
  <div>
    <p>
      <i>
        As of {lastUpdated},{" "}
        <strong>{tentativeAgreements} tentative agreements</strong> were met
        between the UC system and the SRU-UAW.
      </i>
    </p>
    {articlesSR.map((item) => (
      <Accordion
        sx={{
          backgroundColor: accordionColors.get(item),
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>
            <i>{item}</i>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            {infoSR[item].intro}
            <br />
            <br />
            <ButtonGroup orientation="vertical" fullWidth>
              {infoSR[item].proposals.map((proposal) => (
                <Button
                  href={proposal.link}
                  color={proposal.color}
                  target="_blank"
                  variant="outlined"
                >
                  {proposal.name}
                </Button>
              ))}
            </ButtonGroup>
          </Typography>
        </AccordionDetails>
      </Accordion>
    ))}
  </div>
);

export default ProposalsSR;
