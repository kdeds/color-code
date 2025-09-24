import { Component, h } from '@stencil/core';
import { Route, match } from 'stencil-router-v2';
import { Router } from '../../';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: true,
})
export class AppRoot {

  render() {
    return (
      <div>
        <header>
          <h1 onClick={() => Router.push('/progress')}>Color Code</h1>
        </header>

        <main>
          <Router.Switch>
            <Route path={match('/challenges/:challenge')} render={({ challenge }) => <app-home challenge={challenge} />}/>
            <Route path={match('/progress')} render={() => <app-progress  />} />
            <Route path={match('/backdoor')} render={() => <app-backdoor  />} />
            <Route path={match('/')} render={() => <app-progress  />} />
          </Router.Switch>
        </main>
      </div>
    );
  }
}
