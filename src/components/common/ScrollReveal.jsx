import React, { useEffect, useRef, useState } from 'react';

/**
 * Hook to automatically observe all elements with `.reveal-on-scroll` class in the DOM.
 * Whenever elements enter the viewport during scrolling, they receive the `.is-revealed` class.
 */
export function useScrollReveal(dependencies = []) {
  useEffect(() => {
    // If IntersectionObserver is not supported, reveal all immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            // Once revealed, unobserve to keep smooth performance
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    // Grab all unrevealed elements
    const elements = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)');
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, dependencies);
}

/**
 * ScrollReveal Wrapper Component
 * Can wrap any section, card, or container to smoothly animate it into view when scrolled to.
 * 
 * Props:
 * - animation: 'fade-up' | 'fade-down' | 'fade-in' | 'zoom-in' | 'slide-left' | 'slide-right'
 * - delay: number (milliseconds, e.g. 150)
 * - duration: number (milliseconds, default 650)
 * - className: custom class names
 * - children: child elements
 */
export const ScrollReveal = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 650,
  className = '',
  as: Component = 'div',
  threshold = 0.1,
  once = true,
  style = {},
  ...rest
}) => {
  const domRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const node = domRef.current;
    if (!node) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          if (once) {
            observer.unobserve(node);
          }
        } else if (!once) {
          setIsRevealed(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
      observer.disconnect();
    };
  }, [threshold, once]);

  const inlineStyles = {
    ...style,
    '--reveal-delay': `${delay}ms`,
    '--reveal-duration': `${duration}ms`
  };

  return (
    <Component
      ref={domRef}
      className={`reveal-on-scroll reveal-${animation} ${isRevealed ? 'is-revealed' : ''} ${className}`.trim()}
      style={inlineStyles}
      {...rest}
    >
      {children}
    </Component>
  );
};
