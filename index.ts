import {
  ApplianceStateDataPoint,
  EnergySaverApplianceStateDataPoint,
  EnergyUsageProfile,
  EnergySavingsProfile,
  RegionType,
} from './@types';

import {
  MAX_IN_PERIOD,
  APPLIANCE_STATES,
  ENERGY_SAVER_APPLIANCE_STATES,
} from './constants/index.constants';

import { findRegions, sumRegions, changeTimeScaleToDay1 } from './utils/util';
import {
  validateInput_calculateEnergyUsageSimple,
  validateInput_calculateEnergySavings,
  validateInput_calculateEnergyUsageForDay,
} from './index.validator';

/**
 * PART 1
 *
 * You have an appliance that uses energy, and you want to calculate how
 * much energy it uses over a period of time.
 *
 * As an input to your calculations, you have a series of events that contain
 * a timestamp and the new state (on or off). You are also given the initial
 * state of the appliance. From this information, you will need to calculate
 * the energy use of the appliance i.e. the amount of time it is switched on.
 *
 * The amount of energy it uses is measured in 1-minute intervals over the
 * period of a day. Given there is 1440 minutes in a day (24 * 60), if the
 * appliance was switched on the entire time, its energy usage would be 1440.
 * To simplify calculations, timestamps range from 0 (beginning of the day)
 * to 1439 (last minute of the day).
 *
 * HINT: there is an additional complication with the last two tests that
 * introduce spurious state change events (duplicates at different time periods).
 * Focus on getting these tests working after satisfying the first tests.
 *
 * The structure for `profile` looks like this (as an example):
 * ```
 * {
 *    initial: 'on',
 *    events: [
 *      { state: 'off', timestamp: 50 },
 *      { state: 'on', timestamp: 304 },
 *      { state: 'off', timestamp: 600 },
 *    ]
 * }
 * ```
 */

/***
 * Solution
 *
 * 1. Validate Input
 * 2. Define rules in a callback to Identify valid regions that make up energy usage.
 *    For example, ON followed by OFF makes a energy usage region
 * 3. Add begining of time and end of time datapoints to profile. timestamp = 0, timestamp = MAX_IN_PERIOD
 * 4. Call Higher Order Function defined in Utils to find regions that satisfy the region rules defined in step 2.
 * 5. Call function defined in Utils to find sum of regions identified in step 4.
 * 6. Return the sum
 */

const calculateEnergyUsageSimple = (profile: EnergyUsageProfile): number => {
  validateInput_calculateEnergyUsageSimple(profile);

  //rules to identify the regions in the timeseries, ecapsulated in a callback
  const regionRules = (
    leftBound: ApplianceStateDataPoint,
    rightBound: ApplianceStateDataPoint
  ): [boolean, ApplianceStateDataPoint] => {
    if (leftBound.state === APPLIANCE_STATES.ON) {
      if (rightBound.state === APPLIANCE_STATES.OFF) {
        return [true, rightBound];
      } else if (
        rightBound.state === APPLIANCE_STATES.ON &&
        rightBound.timestamp === MAX_IN_PERIOD
      ) {
        return [true, rightBound];
      }
      return [false, leftBound];
    }
    return [false, rightBound];
  };

  // Add first and last endpoint to the datapoints
  const beginingOfTimeDataPoint: ApplianceStateDataPoint =
    getApplianceStateDataPoint(profile.initial, 0);
  profile.events = [beginingOfTimeDataPoint, ...profile.events];

  const profileLastEventDataPoint = profile.events[profile.events.length - 1];
  const endOfTimeDatapoint: ApplianceStateDataPoint =
    getApplianceStateDataPoint(profileLastEventDataPoint.state, MAX_IN_PERIOD);
  profile.events = [...profile.events, endOfTimeDatapoint];

  //find regions
  const regions: RegionType = findRegions(profile, regionRules);

  //sum regions
  const energyUsage: number = sumRegions(regions);

  return energyUsage;
};

/**
 * PART 2
 *
 * You purchase an energy-saving device for your appliance in order
 * to cut back on its energy usage. The device is smart enough to shut
 * off the appliance after it detects some period of disuse, but you
 * can still switch on or off the appliance as needed.
 *
 * You are keen to find out if your shiny new device was a worthwhile
 * purchase. Its success is measured by calculating the amount of
 * energy *saved* by device.
 *
 * To assist you, you now have a new event type that indicates
 * when the appliance was switched off by the device (as opposed to switched
 * off manually). Your new states are:
 * * 'on'
 * * 'off' (manual switch off)
 * * 'auto-off' (device automatic switch off)
 *
 * (The `profile` structure is the same, except for the new possible
 * value for `initial` and `state`.)
 *
 * Write a function that calculates the *energy savings* due to the
 * periods of time when the device switched off your appliance. You
 * should not include energy saved due to manual switch offs.
 *
 * You will need to account for redundant/non-sensical events e.g.
 * an off event after an auto-off event, which should still count as
 * an energy savings because the original trigger was the device
 * and not manual intervention.
 */

/***
 * Solution
 *
 * 1. Validate Input
 * 2. Define rules in a callback to Identify valid regions that make up energy savings.
 *    For example AUTO-OFF followed by ON is a energy saving region.
 * 3. Add begining of time and end of time datapoints to profile. timestamp = 0, timestamp = MAX_IN_PERIOD
 * 4. Call Higher Order Function defined in Utils to find regions that satisfy the region rules defined in step 2.
 * 5. Call function defined in Utils to find sum of regions identified in step 4.
 * 6. Return the sum
 */

const calculateEnergySavings = (profile: EnergySavingsProfile): number => {
  validateInput_calculateEnergySavings(profile);

  //rules to identify the regions in the timeseries, ecapsulated in a callback
  const regionRules = (
    leftBound: EnergySaverApplianceStateDataPoint,
    rightBound: EnergySaverApplianceStateDataPoint
  ): [boolean, EnergySaverApplianceStateDataPoint] => {
    if (
      leftBound.state === ENERGY_SAVER_APPLIANCE_STATES.OFF &&
      rightBound.state === ENERGY_SAVER_APPLIANCE_STATES.AUTO_OFF
    ) {
      return [false, leftBound];
    } else if (
      leftBound.state === ENERGY_SAVER_APPLIANCE_STATES.AUTO_OFF &&
      rightBound.state === ENERGY_SAVER_APPLIANCE_STATES.OFF &&
      rightBound.timestamp === MAX_IN_PERIOD
    ) {
      return [true, rightBound];
    } else if (
      leftBound.state === ENERGY_SAVER_APPLIANCE_STATES.AUTO_OFF &&
      rightBound.state === ENERGY_SAVER_APPLIANCE_STATES.AUTO_OFF &&
      rightBound.timestamp === MAX_IN_PERIOD
    ) {
      return [true, rightBound];
    } else if (
      leftBound.state === ENERGY_SAVER_APPLIANCE_STATES.AUTO_OFF &&
      rightBound.state === ENERGY_SAVER_APPLIANCE_STATES.OFF
    ) {
      return [false, leftBound];
    } else if (
      leftBound.state === ENERGY_SAVER_APPLIANCE_STATES.AUTO_OFF &&
      rightBound.state === ENERGY_SAVER_APPLIANCE_STATES.ON
    ) {
      return [true, rightBound];
    } else {
      return [false, rightBound];
    }
  };

  // Add first and last endpoint to the datapoints
  const beginingOfTimeDataPoint: EnergySaverApplianceStateDataPoint =
    getEnergySaverApplianceStateDataPoint(profile.initial, 0);
  profile.events = [beginingOfTimeDataPoint, ...profile.events];

  const profileLastEventDataPoint = profile.events[profile.events.length - 1];
  const endOfTimeDatapoint: EnergySaverApplianceStateDataPoint =
    getEnergySaverApplianceStateDataPoint(
      profileLastEventDataPoint.state,
      MAX_IN_PERIOD
    );
  profile.events = [...profile.events, endOfTimeDatapoint];
  //find regions
  const regions: RegionType = findRegions(profile, regionRules);

  //sum regions
  const energySavings: number = sumRegions(regions);

  return energySavings;
};

/**
 * PART 3
 *
 * The process of producing metrics usually requires handling multiple days of data. The
 * examples so far have produced a calculation assuming the day starts at '0' for a single day.
 *
 * In this exercise, the timestamp field contains the number of minutes since a
 * arbitrary point in time (the "Epoch"). To simplify calculations, assume:
 *  - the Epoch starts at the beginning of the month (i.e. midnight on day 1 is timestamp 0)
 *  - our calendar simply has uniform length 'days' - the first day is '1' and the last day is '365'
 *  - the usage profile data will not extend more than one month
 *
 * Your function should calculate the energy usage over a particular day, given that
 * day's number. It will have access to the usage profile over the month.
 *
 * It should also throw an error if the day value is invalid i.e. if it is out of range
 * or not an integer. Specific error messages are expected - see the tests for details.
 *
 * (The `profile` structure is the same as part 1, but remember that timestamps now extend
 * over multiple days)
 *
 * HINT: You are encouraged to re-use `calculateEnergyUsageSimple` from PART 1 by
 * constructing a usage profile for that day by slicing up and rewriting up the usage profile you have
 * been given for the month.
 */

/***
 * Solution
 *
 * 1. Validate Input
 * 2. Call function defined in Utils scale the day's usage to [0-MAX_IN_PERIOD] interval.
 * 3. Call `calculateEnergyUsageSimple` to find energy usage for that day.
 * 4. Return the energy usage
 */

const calculateEnergyUsageForDay = (
  monthUsageProfile: EnergyUsageProfile,
  day: number
): number => {
  validateInput_calculateEnergyUsageForDay(monthUsageProfile, day);
  const [initialState, dayDataPoints] = changeTimeScaleToDay1(
    monthUsageProfile,
    day
  );

  return calculateEnergyUsageSimple({
    initial: initialState,
    events: dayDataPoints,
  });
};

//Helpers

const getApplianceStateDataPoint = (
  state: APPLIANCE_STATES,
  timestamp: number
): ApplianceStateDataPoint => {
  return { state: state, timestamp: timestamp };
};

const getEnergySaverApplianceStateDataPoint = (
  state: ENERGY_SAVER_APPLIANCE_STATES,
  timestamp: number
): EnergySaverApplianceStateDataPoint => {
  return { state: state, timestamp: timestamp };
};

module.exports = {
  calculateEnergyUsageSimple,
  calculateEnergySavings,
  calculateEnergyUsageForDay,
};