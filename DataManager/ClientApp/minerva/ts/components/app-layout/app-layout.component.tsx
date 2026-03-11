import { PropsWithChildren } from 'react';
import { LoadingIndicator } from 'rosie/components';

export function AppLayout(props: PropsWithChildren<any>) {
  return <div className="fullscreen">
    <LoadingIndicator />
    <div className="app fullscreen d-flex flex-row">
      {props.children}
    </div>
  </div>
}