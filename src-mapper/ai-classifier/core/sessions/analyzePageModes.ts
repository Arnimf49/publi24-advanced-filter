/**
 * Mode-specific instruction prompts for analyze_page sub-AI session.
 * These are injected once per mode when requested.
 * Each mode's prompt is loaded from its corresponding MD file in prompts/analyzePageModes/.
 */
import { loadPrompt } from '../../prompts/loadPrompt.js';

export const MODE_PROMPTS: Record<string, string> = {
  'full':                     loadPrompt('analyzePageModes/full.md'),
  'is-domain-escort-listing': loadPrompt('analyzePageModes/is-domain-escort-listing.md'),
  'is-escort-listing-agency': loadPrompt('analyzePageModes/is-escort-listing-agency.md'),
  'has-escort-profile':       loadPrompt('analyzePageModes/has-escort-profile.md'),
  'has-escort-list':          loadPrompt('analyzePageModes/has-escort-list.md'),
  'has-country-select':       loadPrompt('analyzePageModes/has-country-select.md'),
  'searching-phone-number':   loadPrompt('analyzePageModes/searching-phone-number.md'),
  'describe-difference':      loadPrompt('analyzePageModes/describe-difference.md'),
};
