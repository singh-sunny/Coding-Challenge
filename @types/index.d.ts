import {
    APPLIANCE_STATES,
    ENERGY_SAVER_APPLIANCE_STATES,
  } from '../constants/index.constants';
  
  type ApplianceStateDataPoint = {
    state: APPLIANCE_STATES;
    timestamp: number;
  };
  
  type EnergySaverApplianceStateDataPoint = {
    state: ENERGY_SAVER_APPLIANCE_STATES;
    timestamp: number;
  };
  
  type EnergyUsageProfile = {
    initial: APPLIANCE_STATES;
    events: ApplianceStateDataPoint[];
  };
  
  type EnergySavingsProfile = {
    initial: ENERGY_SAVER_APPLIANCE_STATES;
    events: EnergySaverApplianceStateDataPoint[];
  };
  
  type DeviceProfileType = EnergyUsageProfile | EnergySavingsProfile;
  type DataPointType =
    | ApplianceStateDataPoint
    | EnergySaverApplianceStateDataPoint;
  type RegionType = Array<[DataPointType, DataPointType]>;
  
  export {
    ApplianceStateDataPoint,
    EnergySaverApplianceStateDataPoint,
    EnergyUsageProfile,
    EnergySavingsProfile,
    DeviceProfileType,
    DataPointType,
    RegionType,
  };