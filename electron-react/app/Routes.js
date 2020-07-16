import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
const LazyCounterPage = React.lazy(() => import('./containers/CounterPage'));
const CounterPage = (props) => (<React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyCounterPage {...props}/>
  </React.Suspense>);
export default function Routes() {
    return (<App>
      <Switch>
        <Route path={routes.COUNTER} component={CounterPage}/>
        <Route path={routes.HOME} component={HomePage}/>
      </Switch>
    </App>);
}
