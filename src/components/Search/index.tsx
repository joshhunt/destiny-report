import React, { useState, useEffect } from "react";
import cx from "classnames";

import s from "./styles.module.scss";
import { MembershipTypeIcon } from "../Icon";
// import Link from "../Link";
import { Link } from "react-router-dom";
import { MembershipType } from "../../types";

type SearchResult = {
  displayName: string;
  membershipId: string;
  membershipType: MembershipType;
  originalMembershipType: MembershipType;
  crossSaveOverride?: {
    membershipId: string;
    membershipType: MembershipType;
  };
};

const Search: React.FC<{ className?: string }> = ({ className }) => {
  const [searchValue, setSearchValue] = useState<string>();
  const [results, setResults] = useState<SearchResult[]>();
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const displayResults = isFocused && results && results.length > 0;

  useEffect(() => {
    if (!searchValue || searchValue.length < 2) {
      setResults(undefined);
      return;
    }

    const valueSearchedFor = searchValue;
    const url = `https://elastic.destinytrialsreport.com/players/0/${searchValue}`;

    fetch(url)
      .then(r => r.json())
      .then(_results => {
        const results: SearchResult[] = _results;

        if (searchValue === valueSearchedFor) {
          const cleanedResults = results.map(result => {
            const hasCrossSaveOverride =
              result.crossSaveOverride &&
              result.crossSaveOverride.membershipId !== "" &&
              result.crossSaveOverride.membershipType !== 0;

            return {
              ...result,
              crossSaveOverride: hasCrossSaveOverride
                ? result.crossSaveOverride
                : undefined
            };
          });

          setResults(cleanedResults);
        }
      });
  }, [searchValue]);

  function clearSearch() {
    setSearchValue(undefined);
    setResults(undefined);
  }

  return (
    <div className={className}>
      <div className={s.searchBox}>
        <input
          onChange={ev => setSearchValue(ev.target.value)}
          value={searchValue || ""}
          className={cx(s.searchField, displayResults && s.hasResults)}
          type="text"
          placeholder="Search for player"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 250)}
        />

        {displayResults && (
          <div className={s.results}>
            {results &&
              results.map(result => {
                const { membershipId, membershipType } =
                  result.crossSaveOverride || result;
                return (
                  <Link
                    className={s.player}
                    key={result.membershipId}
                    to={`/${membershipType}/${membershipId}`}
                    // onClick={clearSearch}
                  >
                    <MembershipTypeIcon type={result.membershipType} />{" "}
                    {result.displayName}
                  </Link>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
