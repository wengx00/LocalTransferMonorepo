export default {
  appTitle: import.meta.env.VITE_APP_TITLE,
  appSlogan: import.meta.env.VITE_APP_SLOGAN,
  base: import.meta.env.VITE_BASE,
  mobileLayoutBreakpoint: Number(import.meta.env.VITE_MOBILE_LAYOUT_BREAKPOINT || '480'),
  apiPrefix: import.meta.env.VITE_API_PREFIX,
  contributor: import.meta.env.VITE_CONTRIBUTOR
};
