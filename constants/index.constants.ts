enum APPLIANCE_STATES {
    ON = 'on',
    OFF = 'off',
  }
  
  enum ENERGY_SAVER_APPLIANCE_STATES {
    ON = 'on',
    OFF = 'off',
    AUTO_OFF = 'auto-off',
  }
  
  enum DEVICE_PROFILE_TYPES {
    ENERGY_USAGE,
    ENERGY_SAVINGS,
  }
  
  const MAX_IN_PERIOD = 1440;
  const YEAR_MIN_DAY = 1;
  const YEAR_MAX_DAY = 365;
  
  export {
    APPLIANCE_STATES,
    ENERGY_SAVER_APPLIANCE_STATES,
    DEVICE_PROFILE_TYPES,
    MAX_IN_PERIOD,
    YEAR_MIN_DAY,
    YEAR_MAX_DAY,
  };