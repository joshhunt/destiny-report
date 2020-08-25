import React, { useState, useRef } from "react";
import Autosuggest, {
  SuggestionsFetchRequestedParams,
  ChangeEvent,
  SuggestionSelectedEventData,
} from "react-autosuggest";
import { MembershipType } from "../../types";
import { MembershipTypeIcon } from "../Icon";

import styles from "./styles.module.scss";

export interface SearchResult {
  displayName: string;
  membershipId: string;
  membershipType: MembershipType;
  originalMembershipType: MembershipType;
  crossSaveOverride?: {
    membershipId: string;
    membershipType: MembershipType;
  };
}

interface PlayerSearchProps {
  onPlayerSelected: (player: SearchResult) => void;
}

const renderSuggestion = (suggestion: SearchResult) => (
  <div>
    <MembershipTypeIcon type={suggestion.membershipType} />{" "}
    {suggestion.displayName}
  </div>
);

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = (suggestion: SearchResult) => suggestion.displayName;

export default function PlayerSearch({ onPlayerSelected }: PlayerSearchProps) {
  const searchValueRef = useRef("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [value, setValue] = useState("");

  // TODO: maybe debounce?
  const onSuggestionsFetchRequested = async ({
    value,
  }: SuggestionsFetchRequestedParams) => {
    searchValueRef.current = value;
    const url = `https://elastic.destinytrialsreport.com/players/0/${value}`;

    const res = await fetch(url);
    const results: SearchResult[] = await res.json();

    // abort search if its old and outdated
    if (value !== searchValueRef.current) {
      return;
    }

    const cleanedResults = results.map((player) => {
      if (
        player.crossSaveOverride &&
        player.crossSaveOverride.membershipId !== ""
      ) {
        return {
          ...player,
          ...player.crossSaveOverride,
        };
      }

      return player;
    });

    setSuggestions(cleanedResults);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onChange = (event: React.FormEvent<any>, { newValue }: ChangeEvent) => {
    setValue(newValue);
  };

  const onSuggestionSelected = (
    event: React.FormEvent<any>,
    { suggestion }: SuggestionSelectedEventData<SearchResult>
  ) => {
    onPlayerSelected(suggestion);
  };

  const inputProps = {
    placeholder: "Search for a player",
    value,
    onChange: onChange,
  };

  return (
    <Autosuggest
      theme={styles}
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      onSuggestionSelected={onSuggestionSelected}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
    />
  );
}
