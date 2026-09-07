"use client";

import type { ICountry, IState } from "country-state-city";
import { Country, State } from "country-state-city";
import { useEffect, useState } from "react";

// Fallback helper converts ISO code to emoji if flag property is missing
const getFlagEmoji = (countryCode: string) =>
  countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

const allCountries = Country.getAllCountries();

interface UseLocationTimeOptions {
  /** Country name ("Nigeria") or ISO code ("NG") */
  country: ICountry["name"];
  /** State name or state code ("FCT Abuja", "Lagos", "FC") */
  state?: IState["name"];
}

export const useLocationTime = ({ country, state }: UseLocationTimeOptions) => {
  const [time, setTime] = useState<string>("");

  // 1. Resolve country by Name or ISO Code
  const countryObj = allCountries.find(
    (c) =>
      c.name.toLowerCase() === country.toLowerCase() ||
      c.isoCode.toLowerCase() === country.toLowerCase(),
  );

  const countryName = countryObj?.name || country;

  // 2. Use package's native `flag` property, with fallback calculation
  const flag =
    countryObj?.flag ||
    (countryObj?.isoCode ? getFlagEmoji(countryObj.isoCode) : "");

  // 3. Dynamically fetch states from package for resolved country
  const countryStates = countryObj
    ? State.getStatesOfCountry(countryObj.isoCode)
    : [];

  const matchedState = countryStates.find(
    (s) =>
      s.name.toLowerCase() === state?.toLowerCase() ||
      s.isoCode.toLowerCase() === state?.toLowerCase(),
  );

  // 4. Resolve timezone automatically
  let derivedTimeZone: string | undefined;

  if (countryObj?.timezones?.length) {
    if (matchedState) {
      const target = matchedState.name.toLowerCase();
      const matchedTz = countryObj.timezones.find(
        (tz) =>
          tz.zoneName.toLowerCase().includes(target) ||
          tz.tzName.toLowerCase().includes(target),
      );
      derivedTimeZone = matchedTz?.zoneName || countryObj.timezones[0].zoneName;
    } else {
      derivedTimeZone = countryObj.timezones[0].zoneName;
    }
  }

  useEffect(() => {
    const updateTime = () => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        ...(derivedTimeZone ? { timeZone: derivedTimeZone } : {}),
      });
      setTime(formatter.format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [derivedTimeZone]);

  const stateDisplay = matchedState?.name || state;
  const place = [stateDisplay, countryName].filter(Boolean).join(", ");

  return {
    time,
    flag,
    countryName,
    place,
    locationWithFlag: `${place} ${flag}`.trim(),
    availableStates: countryStates.map((s) => s.name),
  };
};
