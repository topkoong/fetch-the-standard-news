import useMediaQuery from '@hooks/use-media-query';

/** Active breakpoint flags for responsive layout (see `use-media-query`). */
export default function useBreakpoints() {
  const breakpoints = {
    isXs: useMediaQuery('(max-width: 640px)'),
    isSm: useMediaQuery('(min-width: 641px) and (max-width: 768px)'),
    isMd: useMediaQuery('(min-width: 769px) and (max-width: 1024px)'),
    isLg: useMediaQuery('(min-width: 1025px) and (max-width: 1279px)'),
    isXl: useMediaQuery('(min-width: 1280px) and (max-width: 1535px)'),
    is2Xl: useMediaQuery('(min-width: 1536px)'),
    active: 'xs',
  };
  if (breakpoints.isXs) breakpoints.active = 'xs';
  if (breakpoints.isSm) breakpoints.active = 'sm';
  if (breakpoints.isMd) breakpoints.active = 'md';
  if (breakpoints.isLg) breakpoints.active = 'lg';
  if (breakpoints.isXl) breakpoints.active = 'xl';
  if (breakpoints.is2Xl) breakpoints.active = '2xl';
  return breakpoints;
}
