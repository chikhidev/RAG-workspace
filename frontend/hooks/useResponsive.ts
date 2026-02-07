import { useEffect, useState } from 'react';

export interface ResponsiveBreakpoints {
  isSmallMobile: boolean;  // < 375px
  isMobile: boolean;       // < 768px
  isTablet: boolean;       // 768px - 1024px
  isDesktop: boolean;      // >= 1024px
  width: number;
}

export const BREAKPOINTS = {
  smallMobile: 375,
  mobile: 768,
  tablet: 1024,
  desktop: 1280
};

export const useResponsive = (): ResponsiveBreakpoints => {
  const [breakpoints, setBreakpoints] = useState<ResponsiveBreakpoints>({
    isSmallMobile: typeof window !== 'undefined' ? window.innerWidth < BREAKPOINTS.smallMobile : false,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < BREAKPOINTS.mobile : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= BREAKPOINTS.mobile && window.innerWidth < BREAKPOINTS.tablet : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= BREAKPOINTS.tablet : true,
    width: typeof window !== 'undefined' ? window.innerWidth : 1024
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setBreakpoints({
        isSmallMobile: width < BREAKPOINTS.smallMobile,
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isDesktop: width >= BREAKPOINTS.tablet,
        width
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoints;
};
