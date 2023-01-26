import Joi from 'joi';
import { ErrorMessages } from './errors/errorMessages';
import { ValidationError } from './errors/validationError';

import {
  YEAR_MIN_DAY,
  YEAR_MAX_DAY,
  APPLIANCE_STATES,
  ENERGY_SAVER_APPLIANCE_STATES,
  DEVICE_PROFILE_TYPES,
} from './constants/index.constants';

/***
 * Function to return Joi schema to validate day
 */
const getDaySchema = (): Joi.NumberSchema =>
  Joi.number()
    .integer()
    .greater(YEAR_MIN_DAY - 1)
    .less(YEAR_MAX_DAY + 1)
    .messages({
      'number.greater': ErrorMessages.DAY_RANGE,
      'number.less': ErrorMessages.DAY_RANGE,
      'number.integer': ErrorMessages.DAY_INPUT_TYPE,
    });

/***
 * Function to return Joi schema to validate ENERGY_USAGE and ENERGY_SAVINGS profile data.
 */
const getDeviceProfileSchema = (
  profileType: DEVICE_PROFILE_TYPES
): Joi.ObjectSchema => {
  let allowedDeviceStates: Array<
    APPLIANCE_STATES | ENERGY_SAVER_APPLIANCE_STATES
  >;

  if (profileType === DEVICE_PROFILE_TYPES.ENERGY_USAGE)
    allowedDeviceStates = Object.values(APPLIANCE_STATES);
  else if (profileType === DEVICE_PROFILE_TYPES.ENERGY_SAVINGS)
    allowedDeviceStates = Object.values(ENERGY_SAVER_APPLIANCE_STATES);

  const schema = Joi.object({
    initial: Joi.string()
      .required()
      .valid(...allowedDeviceStates!)
      .messages({
        'any.only': ErrorMessages.INVALID_PROFILE_INITIAL_STATE,
        'any.required': ErrorMessages.MISSING_PROFILE_INITIAL_STATE,
      }),
    events: Joi.array()
      .items(
        Joi.object({
          state: Joi.string()
            .required()
            .valid(...allowedDeviceStates!)
            .messages({
              'any.only': ErrorMessages.INVALID_DEVICE_STATE_IN_EVENT,
              'any.required': ErrorMessages.MISSING_STATE_IN_EVENT,
            }),
          timestamp: Joi.number().integer().greater(0).required().messages({
            'number.greater': ErrorMessages.INVALID_TIMESTAMP_IN_EVENT,
            'any.required': ErrorMessages.MISSING_TIMESTAMP_IN_EVENT,
          }),
        })
      )
      .min(0)
      .required()
      .messages({
        'any.required': ErrorMessages.MISSING_PROFILE_EVENTS,
      }),
  });

  return schema;
};

type ValidationInput = Array<[any, Joi.Schema]>;

/***
 * Input is Array of tuples.
 * Each tuple is [data, Joi Schema to Validate the data]
 * Throw ValidationError if validation fails
 */
const validate = (inputs: ValidationInput): void => {
  inputs.forEach((input) => {
    const [data, JoiSchema] = input;
    const result = JoiSchema.validate(data, { abortEarly: false });

    if (result.error) {
      const errMsgs: Array<string> = [];
      result.error.details.forEach((error) => {
        errMsgs.push(error.message);
      });
      throw new ValidationError(errMsgs.join('\n'));
    }
  });
};

const validateInput_calculateEnergyUsageSimple = (profile): void => {
  validate([
    [profile, getDeviceProfileSchema(DEVICE_PROFILE_TYPES.ENERGY_USAGE)],
  ]);
};

const validateInput_calculateEnergySavings = (profile): void => {
  validate([
    [profile, getDeviceProfileSchema(DEVICE_PROFILE_TYPES.ENERGY_SAVINGS)],
  ]);
};

const validateInput_calculateEnergyUsageForDay = (
  monthUsageProfile,
  day
): void => {
  validate([
    [
      monthUsageProfile,
      getDeviceProfileSchema(DEVICE_PROFILE_TYPES.ENERGY_USAGE),
    ],
    [day, getDaySchema()],
  ]);
};

export {
  validateInput_calculateEnergyUsageSimple,
  validateInput_calculateEnergySavings,
  validateInput_calculateEnergyUsageForDay,
};