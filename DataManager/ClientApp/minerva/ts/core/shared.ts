import $ from 'jquery/slim';
import toastr from 'toastr';
import * as d3 from 'd3';

//region ===== Configuration =====
toastr.options.closeButton = true;
toastr.options.preventDuplicates = true;
toastr.options.positionClass = 'toast-bottom-right';
toastr.options.timeOut = 5000;
//endregion

export const query = (selectors: string) => $(selectors);
export const beforeProcessing = () => query('.loading-indicator').show();
export const afterProcessing = () => query('.loading-indicator').hide();

export const alertInfo = toastr.info;
export const alertSuccess = toastr.success;
export const alertWarning = toastr.warning;
export const alertError = toastr.error;

// https://github.com/d3/d3-format#locale_format
// [​[fill]align][sign][symbol][0][width][,][.precision][~][type]
export const d3Pattern = (specifier: string = ',.2~f') => d3.format(specifier);
export const d3Format = (value: number | { valueOf(): number } = 0, pattern: string = ',.2~f') => d3.format(pattern)(value ?? 0)
