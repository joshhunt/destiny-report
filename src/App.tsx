import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./views/Home";
import GhostAuthReturn from "./views/GhostAuthReturn";
import Triumphs from "./views/Triumphs";
import Nightfalls from "./views/Nightfalls";
import DiscordLanding from "./views/DiscordLanding";

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/triumphs">
          <Triumphs />
        </Route>

        <Route path="/discord-landing"></Route>

        <Route path="/nightfalls">
          <Nightfalls />
        </Route>

        <Route path="/:membershipType(\d+)/:membershipId(\d+)">
          <Home />
        </Route>

        <Route path="/ghost-auth-return">
          <GhostAuthReturn />
        </Route>

        <Route path="/old-home">
          <Home />
        </Route>

        <Route path="/">
          <DiscordLanding />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
