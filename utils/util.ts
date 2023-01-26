import {
    DeviceProfileType,
    DataPointType,
    RegionType,
    EnergyUsageProfile,
    ApplianceStateDataPoint,
  } from '../@types';
  import { MAX_IN_PERIOD, APPLIANCE_STATES } from '../constants/index.constants';
  
  /***
   * Given profile data and region rules, finds the regions that satisfy the region rules.
   */
  const findRegions = (profile: DeviceProfileType, cb): RegionType => {
    const regions: RegionType = [];
    const dataPoints: DataPointType[] = profile.events;
  
    let leftBound: DataPointType = dataPoints[0];
  
    for (let i = 1; i < dataPoints.length; i++) {
      const currDataPoint = dataPoints[i];
      const [isValidRegion, newLeftBound] = cb(leftBound, currDataPoint);
      if (isValidRegion) {
        regions.push([leftBound, currDataPoint]);
      }
      leftBound = newLeftBound;
    }
  
    return regions;
  };
  
  /***
   * Given Array of regions, finds their sum.
   */
  const sumRegions = (regions: RegionType): number => {
    let sum = 0;
    regions.forEach((r) => {
      sum = sum + (r[1].timestamp - r[0].timestamp);
    });
  
    return sum;
  };
  
  /***
   * Given a day and profile data of multiple days, scales datapoints from that day to [0-MAX_IN_PERIOD]
   * 
   */
  const changeTimeScaleToDay1 = (
    monthUsageProfile: EnergyUsageProfile,
    day: number
  ): [APPLIANCE_STATES, ApplianceStateDataPoint[]] => {
    const dayEndTS: number = day * MAX_IN_PERIOD;
    const datStartTS: number = dayEndTS - MAX_IN_PERIOD;
    const allDataPoints: ApplianceStateDataPoint[] = monthUsageProfile.events;
    const dayDataPoints: ApplianceStateDataPoint[] = [];
  
    let initialState: APPLIANCE_STATES = monthUsageProfile.initial;
  
    for (let i = 0; i < allDataPoints.length; i++) {
      // we dont want to work on the input copy.
      const dp: ApplianceStateDataPoint = {
        state: allDataPoints[i].state,
        timestamp: allDataPoints[i].timestamp,
      };
  
      if (dp.timestamp < datStartTS) {
        initialState = dp.state;
      }
  
      if (dp.timestamp >= datStartTS && dp.timestamp <= dayEndTS) {
        if (dayDataPoints.length === 0) {
          if (dp.timestamp > datStartTS) {
            initialState = i > 0 ? allDataPoints[i - 1].state : initialState;
          } else {
            initialState = dp.state;
          }
        }
  
        dp.timestamp = dp.timestamp - (day - 1) * MAX_IN_PERIOD;
        dayDataPoints.push(dp);
      }
    }
  
    return [initialState, dayDataPoints];
  };
  
  export { findRegions, sumRegions, changeTimeScaleToDay1 };