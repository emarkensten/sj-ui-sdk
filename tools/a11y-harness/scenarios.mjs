/*
 * What the harness does per component. Stories come from Storybook's index ("Jämförelse/<Component>").
 *
 * flows: keyboard flows run in every story, on both sides. Each step is a key as Playwright names it
 *        ("Tab", "Shift+Tab", "Enter", " " for Space, "ArrowDown", "Escape"). The page starts with focus
 *        before the component, so the first Tab lands on it.
 * mobile: also run every story at 375 x 812, for components that switch to a sheet below 600 px.
 * vo:     the stories VoiceOver walks through (real speech is slow, so a few per component),
 *         and the steps after reading the component at rest. The VoiceOver cursor starts on the first
 *         item in the page. "VO:next" is VO-Right, "VO:act" is VO-Space (how VoiceOver users press
 *         things); other steps are keys. Tab is left to the fast checks: Safari's Tab skips buttons
 *         without tabindex by default, which the fast checks in WebKit already show.
 */
export const components = {
  FlowButton: {
    flows: { "Tab, Enter, Space": ["Tab", "Enter", " "] },
    vo: { stories: ["Grön", "Inaktiv", "Spinner", "Symbol höger", "Länk"], keys: ["VO:act"] },
  },
  Switch: {
    flows: { "Tab, Space, Space": ["Tab", " ", " "] },
    vo: { stories: ["Med etikett", "Av", "Inaktiverad", "Utan etikett", "Obligatorisk"], keys: ["VO:act", "VO:act"] },
  },
  Select: {
    mobile: true,
    flows: {
      "Öppna med Enter och välj": ["Tab", "Enter", "ArrowDown", "Enter"],
      "Öppna med Space och stäng med Esc": ["Tab", " ", "Escape"],
      "Pil ned på stängd lista": ["Tab", "ArrowDown"],
      "Tab ut ur öppen lista": ["Tab", "Enter", "Tab"],
    },
    vo: { stories: ["Standard"], keys: ["VO:act", "ArrowDown", "Enter"] },
  },
  DatePicker: {
    mobile: true,
    flows: {
      "Fält, kalenderknapp, öppna, välj": ["Tab", "Tab", "Enter", "ArrowRight", "Enter"],
      "Öppna kalendern och stäng med Esc": ["Tab", "Tab", "Enter", "Escape"],
      "Tab genom öppen kalender": ["Tab", "Tab", "Enter", "Tab", "Tab", "Tab"],
    },
    vo: { stories: ["Standard", "Fel (errorHelperText)"], keys: ["VO:next", "VO:act", "ArrowRight", "Enter"] },
  },
  DepartureCard: {
    flows: { "Tab, Enter, Tab": ["Tab", "Enter", "Tab"] },
    vo: { stories: ["Bokningsbar", "Slutsåld", "Inställd", "Nattåg", "Utan pris", "Reseklasser"], keys: ["VO:act"] },
  },
};

export const viewports = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 375, height: 812 },
};
