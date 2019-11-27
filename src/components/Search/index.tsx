import React, { useState, useEffect } from "react";
import cx from "classnames";

import s from "./styles.module.scss";
import { MembershipTypeIcon } from "../Icon";
import Link from "../Link";
import { MembershipType } from "../../types";

type SearchResult = {
  displayName: string;
  membershipId: string;
  membershipType: MembershipType;
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
      .then(results => {
        if (searchValue === valueSearchedFor) {
          setResults(results);
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

        <div className={s.results}>
          {displayResults &&
            results &&
            results.map(result => {
              return (
                <Link
                  className={s.player}
                  key={result.membershipId}
                  to={`/${result.membershipType}/${result.membershipId}`}
                  onClick={clearSearch}
                >
                  <MembershipTypeIcon type={result.membershipType} />{" "}
                  {result.displayName}
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Search;

// 5212225342
