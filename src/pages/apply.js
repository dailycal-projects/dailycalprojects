import * as React from 'react';
import { withStyles } from '@material-ui/core';
import Seo from '../components/seo';
import Logo from '../components/logo';
import puzzleImage from '../images/YXVZ.png';
import { styles } from '../styles/customTheme';

const FORM_ENDPOINT = 'https://docs.google.com/forms/u/1/d/e/1FAIpQLSePLXRqoC3Vq_Q2OqvOyao0pbZdSS6_9Ysuc1pQ24oN_hnyOA/formResponse';
const NAME_ENTRY = 'entry.470059188';
const PUZZLE_ENTRY = 'entry.1075183610';

const ApplyPage = ({ classes }) => {
  const [name, setName] = React.useState('');
  const [puzzle, setPuzzle] = React.useState('');
  const [status, setStatus] = React.useState('idle');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('submitting');

    const body = new URLSearchParams();
    body.append(NAME_ENTRY, name);
    body.append(PUZZLE_ENTRY, puzzle);
    body.append('fvv', '1');
    body.append('pageHistory', '0');
    body.append('submissionTimestamp', String(Date.now()));

    try {
      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      setStatus('submitted');
      setName('');
      setPuzzle('');
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className={classes.main}>
      <Seo title="Puzzle" />
      <Logo />
      <div className={classes.applyContent}>
        <p className={classes.applyBlurb}>Thanks for checking out our flyer. We are the Data Department of The Daily Californian, UC Berkeley’s student newspaper. We work on long-form investigative pieces as well as interactive visualizations of interesting data. Check out our work by clicking the logo above.</p>
        <p className={classes.applyBlurb}>
          Find&nbsp;
          <a href="https://docs.google.com/document/d/1jPmAR61Rlja7NTKzlBAPDng3xCfBVSrnasSsemI_v34/edit?tab=t.0#bookmark=id.lwr8lo59nvj2">application materials and instructions here</a>
          . The flyer you found also contains a supplemental puzzle which is not required to apply. If you figure it out, use the form below to submit your answer, along with the name you submitted on your application.
        </p>

        <form className={classes.applyForm} onSubmit={handleSubmit}>
          <div>
            <label className={classes.applyField} htmlFor="name">
              Name
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label className={classes.applyField} htmlFor="puzzle">
              Puzzle solution
              <input
                id="puzzle"
                name="puzzle"
                type="text"
                value={puzzle}
                onChange={(e) => setPuzzle(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        {status === 'submitted' && <p>Puzzle submitted</p>}
        {status === 'error' && <p>Something went wrong. Please try again.</p>}

        <br />
        <br />
        <i>P.S. This might help!</i>
        <img className={classes.applyImage} src={puzzleImage} alt="Puzzle" />

      </div>
    </div>
  );
};

export default withStyles(styles)(ApplyPage);
