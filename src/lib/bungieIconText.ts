import allIconData from "./iconLookup.json";

const cache: Record<string, string> = {};

const iconData = allIconData.en;

export default function bungieIconText(text: string) {
  if (cache[text]) {
    return cache[text];
  }

  let working = text;

  for (const [find, replace] of iconData) {
    working = working.replace(find, replace);
  }

  return working;
}
