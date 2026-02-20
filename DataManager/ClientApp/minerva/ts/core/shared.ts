import $ from 'jquery/slim';
import toastr from 'toastr';

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