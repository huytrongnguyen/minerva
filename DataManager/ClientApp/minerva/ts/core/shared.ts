import $ from 'jquery/slim';

export const query = (selectors: string) => $(selectors);
export const beforeProcessing = () => query('.loading-indicator').show();
export const afterProcessing = () => query('.loading-indicator').hide();