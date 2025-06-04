import { Dictionary } from './types';

export const isString = (value: any) => typeof value === 'string';
export const isNumber = (value: any) => typeof value === 'number';
export const isBoolean = (value: any) => typeof value === 'boolean';
export const isObject = (value: any) => toString.call(value) === '[object Object]';
export const isArray = (value: any) => toString.call(value) === '[object Array]';
export const isDate = (value: any) => toString.call(value) === '[object Date]' && !isNaN(value);
export const isEmpty = (value: any) => value === undefined || value == null || value === '' || (isString(value) && value.trim() === '') || (isArray(value) && value.length === 0) || (isObject(value) && Object.keys(value).length === 0);
export const isNotEmpty = (value: any) => !isEmpty(value);


export function classNames(...expressions: any[]) {
  return expressions
      .filter(exp => isNotEmpty(exp))
      .map(exp => {
        if (isString(exp)) {
          return exp as string;
        } else if (isObject(exp)) {
          return Object.entries(exp as Dictionary<boolean>)
              .filter(([_key, value]) => value === true)
              .map(([key, _value]) => key)
              .join(' ');
        } else {
          return '';
        }
      })
      .filter(className => isNotEmpty(className))
      .join(' ');
}