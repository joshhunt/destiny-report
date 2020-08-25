import React from "react";

import s from "./styles.module.scss";
import Icon from "../../components/Icon";

export default function Explainer() {
  return (
    <div className={s.explainer}>
      <br />
      <section>
        <h3>Legend</h3>
        <p>
          <Icon className={s.timeIconWhite} name="star" solid /> Times from a
          single account with the emblem. Aim for all of these times.
        </p>
        <p>
          <Icon className={s.timeIconWhite} name="star" /> Slowest speedruns
          from a number of accounts found with the emblem. You should meet at
          least this speed.
        </p>
      </section>

      <section>
        <h3>
          How do you get the <em>After the Nightfall</em> emblem?
        </h3>
        <p>
          No one knows for sure how to get the emblem. However, it seems to have
          something to do with doing all Forsaken-era Nightfalls really fast.
        </p>
      </section>

      <section>
        <h3>
          The times on the website are different from what appears in game.
        </h3>
        <p>
          Yup - this is something speedrunners have experienced for a while.
          Activity time in the API differs slightly from the in-game time. The
          API timer starts while you're loading into the activity, whereas the
          in-game timer usually starts once all players have spawned in. This
          means that the time on this site will be affected by your
          console/network/PC speed.
        </p>
        <p>
          All times on this page, including the target times, are API times so
          should be roughly comparable.
        </p>
      </section>

      <section>
        <h3>I met all the times but the emblem didn't drop.</h3>
        <p>
          Like mentioned before, the exact criteria is unknown. If you've met
          the times and the emblem didn't drop, try:
        </p>

        <ol>
          <li>
            Look in the Postmaster. The emblem doesn't drop directly into your
            inventory, it goes to the Postmaster. Weird.
          </li>
          <li>
            Run another Nightfall (or two, or three). A few players have
            reported the emblem dropping after doing a few more Nightfalls after
            meeting the times. Some have theorised it's RNG after meeting all
            the times.
          </li>
          <li>
            Make sure all Nightfalls were ran in the same season, with the same
            character. Again, it's not known if this is 100% required, but we're
            just trying to eliminate things here.
          </li>
          <li>
            Tag community managers on Twitter or reddit or whatever and ask
            them?
          </li>
          <li>Cry.</li>
        </ol>
      </section>

      <br />
      <br />
    </div>
  );
}
