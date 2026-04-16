import type { ChatCompletionTool } from 'openai/resources/chat/completions';

export const definitions: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'analyze_page',
      description: 'Request analysis of current page using one or more analysis modes. Returns structured findings for each requested mode. Each mode produces specific insights: is-domain-escort-listing (yes/no/maybe verdict on whether site is escort listing), is-escort-listing-agency (agency vs open listing), has-escort-profile (individual profile detection), has-escort-list (directory/listing page detection), has-country-select (location selector detection), searching-phone-number (phone visibility status including subscription gate detection). Use full mode for comprehensive initial analysis covering all aspects.',
      parameters: {
        type: 'object',
        properties: {
          modes: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'full',
                'is-domain-escort-listing',
                'is-escort-listing-agency',
                'has-escort-profile',
                'has-escort-list',
                'has-country-select',
                'searching-phone-number',
              ],            },
            minItems: 1,
          },
          reason: { type: 'string' },
        },
        required: ['modes', 'reason'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_actionable_elements',
      description: 'Request filtered list of actionable elements matching a specific mode. Returns elements with reasoning. Modes: accept-verification (find controls that dismiss overlays, accept age verification, close cookie banners, bypass gates), reveal-phone-number (find controls that reveal hidden phone numbers like show-number buttons), profile-revealing (find buttons or links that navigate deeper into a profile or open a contact/messaging flow — use when has-escort-profile reports hasProfileRevealingButtons=true).',
      parameters: {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['accept-verification', 'reveal-phone-number', 'profile-revealing'],
          },
          reason: { type: 'string' },
        },
        required: ['mode', 'reason'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'click_element',
      description: 'Click one or more visible actionable elements from the current page. Provide elementIds as an array — elements are clicked in the order given. Use for entry gates, age checks, overlay dismissals, phone reveal buttons, and any other clickable controls. When dismissing stacked modals, pass IDs in top-to-bottom order (outermost/topmost overlay first).',
      parameters: {
        type: 'object',
        properties: {
          elementIds: { type: 'array', items: { type: 'string' }, minItems: 1, description: 'IDs of elements to click, in order.' },
          reason: { type: 'string' },
        },
        required: ['elementIds', 'reason'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'open_element_href',
      description: 'Navigate to a same-host http(s) URL. Provide either: (a) elementId — an actionable element whose href will be used, or (b) href — a URL or path returned directly from analyze_page findings (e.g. escortProfileUrls, nextBestPages). Never use on tel:, sms:, mailto:, WhatsApp, Telegram, javascript:, or other special-scheme contact actions.',
      parameters: {
        type: 'object',
        properties: {
          elementId: { type: 'string', description: 'ID of an actionable element that exposes a same-host href. Use when navigating via an element on the page.' },
          href: { type: 'string', description: 'URL or path to navigate to directly. Use when a URL was returned by analyze_page (e.g. escortProfileUrls, nextBestPages).' },
          reason: { type: 'string' },
        },
        required: ['reason'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'verify_phone_action',
      description: 'Verify that a found phone behaves like a real contact path instead of redirect bait. Use this whenever you found a phone number before classify_as_escort, even if the phone is not obviously clickable. If a clickable phone/contact/whatsapp/sms action exists, target it; otherwise probe the visible phone text area. It is only acceptable if nothing meaningful happens or it opens a phone-specific URL; if it opens a new tab or navigates to another domain, treat that as bad redirect bait.',
      parameters: {
        type: 'object',
        properties: {
          elementId: { type: 'string' },
          phoneNumber: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['phoneNumber', 'reason'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'open_homepage',
      description: 'Navigate to the current site homepage/root.',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        required: ['reason'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'classify_as_escort',
      description: 'Classify the current domain as an escort listing site. Use contactAccess="phone_visible" for the normal case with real visible phone numbers backed by 2 distinct verified real phones from the original same-host site. Use contactAccess="shared_venue_phone" only for clear venue-style escort operations such as clubs, brothels, laufhaus, saunaclubs, or single-house venues where multiple escorts share one real same-host venue phone; this requires explicit venue evidence plus one verified real phone for that venue. Use contactAccess="contact_gated" when direct explicit same-host escort-profile evidence is present but contact/phone access is blocked by any gate — including subscription/login walls, captcha, or human-verification challenges. The country field must be a supported lowercase country code such as de, ro, fr, nl, not a country name like germany or romania. Do not use this for speculative, adjacent, or "may contain escort listings" cases. Generic massage, wellness, spa, therapy, magazine, directory, adult retail, lingerie, sex-toy, or other product-commerce content is not enough. A massage service with a visible phone number is still not escort unless the page also contains direct explicit sexual-service or escort evidence.',
      parameters: {
        type: 'object',
        properties: {
          country: { type: 'string' },
          phoneNumber: { type: 'string' },
          contactAccess: { type: 'string', enum: ['phone_visible', 'shared_venue_phone', 'contact_gated'] },
          reasoning: { type: 'string' },
          confidence: { type: 'integer' },
        },
        required: ['country', 'reasoning', 'confidence'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'classify_as_bad',
      description: 'Classify the current domain as not being an escort listing site. Use this when the original site lacks a real phone-backed escort listing, when it is a normal massage/spa/wellness/salon/therapy business, when it is adult retail or product-commerce such as lingerie or sex-toy listings, when it is a cam/private-chat/live-chat platform, or when it is a fake chat/dating funnel with profile bait, signup steps, "start chat" CTAs, private-conversation bait, or other thin chat-invite pages instead of real escort evidence.',
      parameters: {
        type: 'object',
        properties: {
          reasoning: { type: 'string' },
          confidence: { type: 'integer' },
        },
        required: ['reasoning', 'confidence'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'flag_for_review',
      description: 'Stop and request manual review because the site remains ambiguous or blocked. The reasoning must explicitly say what evidence you found, what actions you tried, and what exact blocker or ambiguity remains.',
      parameters: {
        type: 'object',
        properties: {
          reasoning: { type: 'string' },
        },
        required: ['reasoning'],
        additionalProperties: false,
      },
    },
  },
];

export const terminalToolNames = new Set([
  'classify_as_escort',
  'classify_as_bad',
  'flag_for_review',
]);

export const terminalToolDefinitions = definitions.filter((toolDefinition) => {
  return toolDefinition.type === 'function' && terminalToolNames.has(toolDefinition.function.name);
});
