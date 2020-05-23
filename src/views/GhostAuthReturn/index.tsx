import React, { useEffect } from "react";
import queryString from "query-string";

import s from "./styles.module.scss";

const GhostAuthReturn: React.FC = () => {
  const queryParams = queryString.parse(window.location.search);
  const authCode = (queryParams?.code || "") as string;

  var ghostUrl =
    "ghost-overlay:///oauth-return?code=" + encodeURIComponent(authCode);

  useEffect(() => {
    window.location.href = ghostUrl;
  }, [ghostUrl]);

  return (
    <div className={s.root}>
      <h1>Ghost auth return</h1>

      {ghostUrl && (
        <p>
          If Ghost does not open, try <a href={ghostUrl}>Clicking here</a>
        </p>
      )}

      <p>Once you're logged in, you can close this page.</p>
    </div>
  );
};

export default GhostAuthReturn;
