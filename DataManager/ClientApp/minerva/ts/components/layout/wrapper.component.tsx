import { PropsWithChildren } from 'react';
import { LoadingIndicator } from 'rosie/components';

export function WrapperComponent(props: PropsWithChildren<any>) {
  return <div className="wrapper position-relative">
    <LoadingIndicator />
    <main>
      {props.children}
    </main>
  </div>
}