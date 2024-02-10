import React from 'react';
import cloudySnowing from "../assets/cloudy_snowing.svg";
import foggy from "../assets/foggy.svg";
import mist from "../assets/mist.svg";
import partlyCloudy from "../assets/partly_cloudy_day.svg";
import rainyHeavy from "../assets/rainy_heavy.svg";
import rainyLight from "../assets/rainy_light.svg";
import snowy from "../assets/snowing.svg";
import sunny from "../assets/sunny.svg";
import thunderstorm from "../assets/thunderstorm.svg";
import weatherHail from "../assets/weather_hail.svg";
import weatherSnowy from "../assets/weather_snowy.svg";
import cloudy from "../assets/cloud.svg";

const weatherIconMapping = {
  395: cloudySnowing,
  392: thunderstorm,
  389: thunderstorm,
  386: thunderstorm,
  377: weatherHail,
  374: weatherHail,
  371: cloudySnowing,
  368: snowy,
  365: weatherHail,
  362: snowy,
  359: rainyHeavy,
  356: rainyHeavy,
  353: rainyLight,
  350: weatherHail,
  338: snowy,
  335: cloudySnowing,
  332: snowy,
  329: snowy,
  326: snowy,
  323: snowy,
  320: weatherSnowy,
  317: weatherHail,
  314: weatherHail,
  311: weatherHail,
  308: rainyHeavy,
  305: rainyHeavy,
  302: rainyHeavy,
  299: rainyHeavy,
  296: rainyLight,
  293: rainyLight,
  284: weatherHail,
  281: weatherHail,
  266: rainyLight,
  263: rainyLight,
  260: foggy,
  248: foggy,
  230: snowy,
  227: weatherSnowy,
  200: thunderstorm,
  185: weatherHail,
  182: weatherHail,
  179: weatherHail,
  176: rainyLight,
  143: mist,
  122: cloudy,
  119: cloudy,
  116: partlyCloudy,
  113: sunny,
};

interface WeatherIconProps {
  weatherCode: number;
  class?: string;
}

const WeatherIcon = ({ weatherCode, class: className }: WeatherIconProps) => {
  const IconSrc = weatherIconMapping[weatherCode];

  // If there's no matching weather code, we could return null or a default icon
  if (!IconSrc) {
    return null;
  }

  return <img class={`h-16 ${className}`} src={IconSrc} alt="Weather icon" />;
};

export default WeatherIcon;