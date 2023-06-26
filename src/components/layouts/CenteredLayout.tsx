import { FC, PropsWithChildren } from 'react';
import classes from './CenteredLayout.module.css';

/// Layout with one centered view
const CenteredLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className={classes.outer}>
    <div className={classes.inner}>{children}</div>
  </div>
);
export default CenteredLayout;
