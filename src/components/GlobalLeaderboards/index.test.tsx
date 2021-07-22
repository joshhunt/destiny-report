import React from "react";
import { render } from "@testing-library/react";

import GlobalLeaderboards from "./index";

const leaderboard = [
  {
    membershipId: `123654`,
    membershipType: 1,
    displayName: "Alex",
    triumphScore: 123035,
    collectionScore: 3731,
    lastCrawled: "2020-03-03T04:03:47.490Z",
    crossSaveOverride: 1,
    applicableMembershipTypes: [3, 1],
    triumphRank: 1,
    collectionRank: 1284,
  },
];

const extraProfiles = [
  {
    profile: {
      membershipId: "4611686018469271298",
      membershipType: 2,
      displayName: "Extra Josh",
      lastCrawled: "2020-03-04T15:18:00.704Z",
      triumphScore: 120585,
      collectionScore: 3457,
      crossSaveOverride: 2,
      applicableMembershipTypes: [1, 3, 2],
    },
    collectionRank: 7612,
    triumphRank: 745,
  },
];

test("renders users from the leaderboard", () => {
  const { getAllByText } = render(
    <GlobalLeaderboards
      isLoading={false}
      leaderboards={leaderboard}
      extraProfiles={[]}
    />
  );

  expect(getAllByText("Alex")).toBeDefined();
});

test("renders users from the extra profiles", () => {
  const { getAllByText } = render(
    <GlobalLeaderboards
      isLoading={false}
      leaderboards={leaderboard}
      extraProfiles={extraProfiles}
    />
  );

  expect(getAllByText("Extra Josh")).toBeDefined();
});
