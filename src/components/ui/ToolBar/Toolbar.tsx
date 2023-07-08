import { FC, PropsWithChildren } from 'react';
import classes from './Toolbar.module.css';

/// Stream control panel
const Toolbar: FC<PropsWithChildren<{ className?: string }>> = ({ className = classes.outer, children }) => (
  <div className={className}>
    <div className={classes.inner}>{children}</div>
  </div>
);
export default Toolbar;
