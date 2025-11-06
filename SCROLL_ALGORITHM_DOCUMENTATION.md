# 📜 Complete Scroll Algorithm Documentation - v1.9.1

## 🎯 Overview

This document contains the **complete, production-ready scroll algorithm** used in the Morning Star Christian Church website. This implementation successfully displays all 3 event cards reliably without skipping.

**Source**: Imported from GitHub v1.5.4 (proven working on Vercel)
**Version**: v1.9.1
**Status**: ✅ Production-Ready

---

## 🏗️ Architecture Overview

### Key Components

1. **Sticky Header** - "Outreach / Upcoming Events" title sticks at top
2. **Scroll Spacer** - 100vh invisible div that creates scroll distance
3. **Event Cards** - 3 positioned cards that fade in/out
4. **Zone-Based Switching** - Asymmetric zones (0-25%, 25-65%, 65-100%)
5. **Scroll Lock** - 800ms lock prevents momentum scrolling
6. **Hysteresis** - 12% threshold prevents flickering at boundaries

---

## 📐 CSS Configuration

### 1. Outreach Section Container
```css
.outreach {
    position: relative;
    min-height: 100vh;
    padding: 60px 40px 200px;
    display: flex;
    flex-direction: column;
}
```

### 2. Sticky Header (Always Visible)
```css
.outreach-header {
    margin-bottom: 8vh;
    position: sticky;
    top: 80px;           /* Sticks 80px from viewport top */
    z-index: 10;         /* Above event cards */
    text-align: left;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
```

**Behavior**: 
- Header scrolls naturally until it reaches 80px from top
- Then it "sticks" and stays visible while events cycle below
- Fades out when scroll progress > 90%

### 3. Scroll Container
```css
.outreach-scroll-container {
    position: relative;
    margin-top: 0;
}
```

### 4. Sticky Wrapper (Freezes Cards in Place)
```css
.sticky-wrapper {
    position: sticky;
    top: 20vh;           /* Freezes at 20% from viewport top */
    height: 62vh;        /* Takes up 62% of viewport height */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-bottom: 100px;
}
```

**Behavior**:
- Cards freeze in middle of screen while user scrolls
- Creates "parallax" effect where background scrolls but cards stay put

### 5. Scroll Spacer (Creates Scroll Distance)
```css
.scroll-spacer {
    height: 100vh;       /* 100% viewport height = scroll distance */
    pointer-events: none; /* Doesn't block interactions */
}
```

**Why 100vh?**
- Originally 250vh caused huge scroll distances
- Reduced to 100vh for "swipe-like" responsive feel
- ~40% viewport scroll per event switch

### 6. Event Slides (Cards)
```css
.event-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    opacity: 0;
    visibility: hidden;
    transform: translateY(30px) scale(0.95);
    transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                visibility 0s 0.4s;
    pointer-events: none;
}

.event-slide.active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
    pointer-events: auto;
    position: relative;
    transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                visibility 0s 0s;
}
```

**Transitions**:
- **Fade**: Opacity 0 → 1 (0.4s)
- **Slide**: translateY(30px) → 0 (0.4s)
- **Scale**: scale(0.95) → 1 (0.4s)
- **Easing**: cubic-bezier(0.25, 0.46, 0.45, 0.94) = smooth ease-out

---

## 💻 JavaScript Implementation

### Complete Algorithm

```javascript
// ============================================================================
// SCROLL ANIMATION FOR EVENT CARDS - COMPLETE IMPLEMENTATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ========================================
    // 1. ELEMENT REFERENCES
    // ========================================
    const eventSlides = document.querySelectorAll('.event-slide');
    const body = document.body;
    const outreachSection = document.querySelector('.outreach');
    const scrollSpacer = document.querySelector('.scroll-spacer');
    const navShell = document.querySelector('.nav-shell');
    
    // Navigation elements
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    // ========================================
    // 2. STATE VARIABLES
    // ========================================
    
    // Mobile nav compression
    let lastNavScrollY = 0;
    let scrollThreshold = 50;
    
    // Event card state
    let currentEventIndex = 0;
    const totalEvents = eventSlides.length; // Should be 3
    
    // Section tracking
    let inOutreachSection = false;
    
    // Scroll lock mechanism (CRITICAL for preventing momentum scrolling)
    let isScrollLocked = false;
    let scrollLockTimer = null;
    let lastEventChangeTime = 0;
    const scrollLockDuration = 800; // 800ms lock after each event change
    
    // ========================================
    // 3. MOBILE NAV COMPRESSION
    // ========================================
    function handleMobileNav() {
        // Only apply on mobile (960px and below)
        if (window.innerWidth <= 960) {
            if (window.scrollY > scrollThreshold) {
                navShell.classList.add('scrolled-mobile');
            } else {
                navShell.classList.remove('scrolled-mobile');
            }
        } else {
            // Remove class on desktop
            navShell.classList.remove('scrolled-mobile');
        }
        lastNavScrollY = window.scrollY;
    }
    
    // ========================================
    // 4. ACTIVE NAV LINK HIGHLIGHTER
    // ========================================
    function updateActiveNavLink() {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // ========================================
    // 5. MAIN SCROLL HANDLER
    // ========================================
    function handleScroll() {
        if (!outreachSection || !scrollSpacer) return;
        
        // Get bounding rectangles
        const outreachRect = outreachSection.getBoundingClientRect();
        const spacerRect = scrollSpacer.getBoundingClientRect();
        
        // Update mobile nav and active link
        handleMobileNav();
        updateActiveNavLink();
        
        // ========================================
        // 5.1 VIEWPORT ENTRY DETECTION
        // ========================================
        // We're "in" the outreach section when:
        // - Section top is at or above 30% from viewport top
        // - Spacer bottom is at or below 70% from viewport top
        if (outreachRect.top <= window.innerHeight * 0.3 && 
            spacerRect.bottom > window.innerHeight * 0.7) {
            
            // ========================================
            // 5.2 SECTION ENTRY (FIRST TIME)
            // ========================================
            if (!inOutreachSection) {
                inOutreachSection = true;
                // Double requestAnimationFrame ensures smooth CSS transition
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        updateActiveEvent(currentEventIndex, false);
                    });
                });
            }
            
            // ========================================
            // 5.3 SCROLL PROGRESS CALCULATION
            // ========================================
            // Adjust spacer position to account for viewport positioning
            const spacerTop = spacerRect.top - window.innerHeight * 0.35;
            const spacerHeight = spacerRect.height - window.innerHeight * 0.5;
            
            // Calculate progress (0 to 1) through spacer
            // When spacerTop = 0, progress = 0
            // When spacerTop = -spacerHeight, progress = 1
            const scrollProgress = Math.max(0, Math.min(1, -spacerTop / spacerHeight));
            
            // ========================================
            // 5.4 STICKY HEADER FADE OUT
            // ========================================
            // Fade out header after scrolling past last event (90%+)
            if (scrollProgress > 0.9) {
                const fadeProgress = Math.min(1, (scrollProgress - 0.9) / 0.1);
                const outreachHeader = document.querySelector('.outreach-header');
                if (outreachHeader) {
                    outreachHeader.style.opacity = String(1 - fadeProgress);
                    outreachHeader.style.transform = `translateY(${-20 * fadeProgress}px)`;
                }
            } else {
                // Reset opacity when scrolling back
                const outreachHeader = document.querySelector('.outreach-header');
                if (outreachHeader) {
                    outreachHeader.style.opacity = '1';
                    outreachHeader.style.transform = 'translateY(0)';
                }
            }
            
            // ========================================
            // 5.5 ZONE-BASED EVENT SWITCHING
            // ========================================
            // Calculate which event should be shown
            // ASYMMETRIC ZONES (not equal thirds):
            // Event 0: 0% - 25%    (25% zone)
            // Event 1: 25% - 65%   (40% zone) ← Largest zone
            // Event 2: 65% - 100%  (35% zone)
            let newEventIndex;
            if (scrollProgress < 0.25) {
                newEventIndex = 0;
            } else if (scrollProgress < 0.65) {
                newEventIndex = 1;
            } else {
                newEventIndex = 2;
            }
            
            // ========================================
            // 5.6 HYSTERESIS (STICKY BOUNDARIES)
            // ========================================
            // Add 12% threshold to prevent flickering at zone boundaries
            // User must scroll 12% past boundary to trigger change
            const threshold = 0.12;
            
            if (newEventIndex > currentEventIndex) {
                // Moving FORWARD - require clear progress past boundary
                const boundary = newEventIndex === 1 ? 0.25 : newEventIndex === 2 ? 0.65 : 0;
                if (scrollProgress < boundary + threshold) {
                    // Not far enough past boundary yet, stay on current event
                    newEventIndex = currentEventIndex;
                }
            } else if (newEventIndex < currentEventIndex) {
                // Moving BACKWARD - require clear progress past boundary
                const boundary = currentEventIndex === 1 ? 0.25 : currentEventIndex === 2 ? 0.65 : 0;
                if (scrollProgress > boundary - threshold) {
                    // Not far enough past boundary yet, stay on current event
                    newEventIndex = currentEventIndex;
                }
            }
            
            // Clamp to valid range
            const clampedIndex = Math.max(0, Math.min(totalEvents - 1, newEventIndex));
            
            // ========================================
            // 5.7 EVENT UPDATE WITH SCROLL LOCK
            // ========================================
            if (clampedIndex !== currentEventIndex) {
                const now = Date.now();
                
                // Only update if enough time has passed since last change
                // This prevents momentum scrolling from skipping through events
                if (!isScrollLocked || (now - lastEventChangeTime) > scrollLockDuration) {
                    currentEventIndex = clampedIndex;
                    updateActiveEvent(currentEventIndex, false);
                    
                    // Lock scrolling temporarily after event change
                    isScrollLocked = true;
                    lastEventChangeTime = now;
                    
                    clearTimeout(scrollLockTimer);
                    scrollLockTimer = setTimeout(() => {
                        isScrollLocked = false;
                    }, scrollLockDuration);
                }
            }
        } else {
            // ========================================
            // 5.8 OUTSIDE SECTION (EXIT)
            // ========================================
            if (inOutreachSection) {
                inOutreachSection = false;
                // Ensure smooth fade out by using requestAnimationFrame
                requestAnimationFrame(() => {
                    resetBackground();
                });
            }
            
            // Update event index based on position
            if (spacerRect.bottom <= window.innerHeight * 0.7) {
                // Scrolled past section - show last event
                if (currentEventIndex !== totalEvents - 1) {
                    currentEventIndex = totalEvents - 1;
                    updateActiveEvent(currentEventIndex, true);
                }
            } else if (outreachRect.top > window.innerHeight * 0.3) {
                // Before section - show first event
                if (currentEventIndex !== 0) {
                    currentEventIndex = 0;
                    updateActiveEvent(0, true);
                }
            }
        }
    }
    
    // ========================================
    // 6. UPDATE ACTIVE EVENT
    // ========================================
    function updateActiveEvent(index, skipBackground = false) {
        // Remove active class from all events
        eventSlides.forEach(slide => slide.classList.remove('active'));
        
        // Add active class to current event
        if (eventSlides[index]) {
            eventSlides[index].classList.add('active');
            
            // Update body background based on event (only if in section)
            if (!skipBackground) {
                body.classList.remove('event-1-active', 'event-2-active', 'event-3-active');
                body.classList.add(`event-${index + 1}-active`);
            }
            
            // Update indicator dots
            const dots = document.querySelectorAll('.event-dot');
            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }
    
    // ========================================
    // 7. RESET BACKGROUND
    // ========================================
    function resetBackground() {
        // Remove all event background classes to return to default
        body.classList.remove('event-1-active', 'event-2-active', 'event-3-active');
    }
    
    // ========================================
    // 8. TOUCH/SWIPE HANDLING (MOBILE)
    // ========================================
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwipeActive = false;
    let swipeDebounceTimer = null;
    const swipeThreshold = 40; // Minimum 40px swipe to register
    const swipeDebounceTime = 600; // 600ms delay before next swipe
    
    const eventsContainer = document.querySelector('.events-container');
    
    if (eventsContainer) {
        eventsContainer.addEventListener('touchstart', (e) => {
            if (isSwipeActive) return;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        eventsContainer.addEventListener('touchend', (e) => {
            if (isSwipeActive) return;
            
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Only process if horizontal swipe is dominant
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
                isSwipeActive = true;
                
                if (deltaX > 0) {
                    // Swipe right - go to previous event
                    if (currentEventIndex > 0) {
                        currentEventIndex--;
                        updateActiveEvent(currentEventIndex, false);
                    }
                } else {
                    // Swipe left - go to next event
                    if (currentEventIndex < totalEvents - 1) {
                        currentEventIndex++;
                        updateActiveEvent(currentEventIndex, false);
                    }
                }
                
                // Reset swipe lock after debounce time
                clearTimeout(swipeDebounceTimer);
                swipeDebounceTimer = setTimeout(() => {
                    isSwipeActive = false;
                }, swipeDebounceTime);
            }
        }, { passive: true });
    }
    
    // ========================================
    // 9. SCROLL EVENT LISTENER (THROTTLED)
    // ========================================
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // ========================================
    // 10. INITIAL CHECK
    // ========================================
    handleScroll();
    
    // ========================================
    // 11. RESIZE HANDLER
    // ========================================
    window.addEventListener('resize', () => {
        handleMobileNav();
    });
});
```

---

## 📊 Algorithm Flow Diagram

```
User Scrolls Page
    ↓
[Throttled with requestAnimationFrame]
    ↓
handleScroll() called
    ↓
[Check if in Outreach Section]
    ↓
YES → Continue  |  NO → Reset to default
    ↓
[Calculate Scroll Progress]
scrollProgress = -spacerTop / spacerHeight
    ↓
[Determine Target Event]
if scrollProgress < 0.25 → Event 0
else if scrollProgress < 0.65 → Event 1
else → Event 2
    ↓
[Apply Hysteresis (0.12 threshold)]
Prevent switches at exact boundaries
    ↓
[Check Scroll Lock (800ms)]
Has enough time passed since last change?
    ↓
YES → Switch Event  |  NO → Stay on current
    ↓
[Update Active Event]
- Fade in new card
- Update background color
- Update indicator dots
    ↓
[Lock Scroll for 800ms]
Prevent momentum scrolling
    ↓
Done (wait for next scroll event)
```

---

## 🔢 Zone Boundaries Explained

### Why Asymmetric Zones?

**Equal thirds (0-33%, 33-66%, 66-100%) FAILED because:**
- First event felt too short to scroll through
- Last event felt too long
- Middle event was just right

**Asymmetric zones (0-25%, 25-65%, 65-100%) WORKS because:**
- Event 1: 25% zone = Quick intro
- Event 2: 40% zone = Main focus (longest)
- Event 3: 35% zone = Finale

### Hysteresis Threshold (0.12 = 12%)

**Without hysteresis:**
- User scrolls to 25.0% → Switches to Event 2
- User scrolls back slightly to 24.9% → Switches back to Event 1
- Result: Flickering at boundaries ❌

**With 0.12 hysteresis:**
- User scrolls to 25.0% → Still Event 1 (need 25% + 12% = 37%)
- User scrolls to 37.0% → NOW switches to Event 2 ✅
- User scrolls back to 36.9% → Still Event 2 (need 25% - 12% = 13%)
- User scrolls back to 13.0% → NOW switches back to Event 1 ✅
- Result: Stable, no flickering ✅

---

## ⏱️ Scroll Lock (800ms)

### Why Scroll Lock is Critical

**Without scroll lock:**
```
User scrolls quickly (momentum)
  → Progress: 10% → 30% → 50% → 70%
  → Events: 0 → 1 → 2 (skips through all 3!)
```

**With 800ms scroll lock:**
```
User scrolls quickly (momentum)
  → Progress: 10% → 30% (switch to Event 1, LOCK)
  → Progress continues: 50% → 70% (LOCKED, no switch)
  → After 800ms: Lock releases
  → Next scroll: Can switch to Event 2
```

### How It Works

1. User scrolls past boundary (e.g., 25% → 37%)
2. Event switches (0 → 1)
3. `isScrollLocked = true`
4. `lastEventChangeTime = Date.now()`
5. Timer set for 800ms
6. All scroll events checked: `if (!isScrollLocked || now - lastEventChangeTime > 800)`
7. After 800ms: `isScrollLocked = false`
8. Next valid scroll can trigger another switch

---

## 🎨 Background Color Transitions

### CSS Classes Applied to `<body>`

```css
/* Default */
body {
    background: linear-gradient(135deg, #f8f9fd 0%, #e9ecf5 100%);
}

/* Event 1 Active */
body.event-1-active {
    background: linear-gradient(135deg, #ffe8d6 0%, #ffd4d4 100%);
}

/* Event 2 Active */
body.event-2-active {
    background: linear-gradient(135deg, #ffd6e8 0%, #ffe5f0 100%);
}

/* Event 3 Active */
body.event-3-active {
    background: linear-gradient(135deg, #c8e6c8 0%, #ffe0e0 50%, #d4f0d4 100%);
}
```

### Transition Applied

```javascript
// In updateActiveEvent()
body.classList.remove('event-1-active', 'event-2-active', 'event-3-active');
body.classList.add(`event-${index + 1}-active`);
```

CSS handles smooth transition automatically (likely 0.4s ease).

---

## 📱 Mobile/Touch Support

### Horizontal Swipe Detection

```javascript
// Left swipe = Next event
// Right swipe = Previous event

const swipeThreshold = 40; // Minimum 40px
const swipeDebounceTime = 600; // 600ms between swipes

// Only process if horizontal swipe is dominant
if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
    // Valid swipe detected
}
```

### Why Separate Touch Handling?

- **Scroll logic**: Handles vertical scrolling (desktop + mobile)
- **Touch logic**: Handles horizontal swiping (mobile only)
- Both can change events independently
- Touch gives direct "previous/next" control

---

## 🐛 Common Issues & Solutions

### Issue 1: Events Skip

**Symptom**: Scrolling quickly skips Event 2
**Cause**: No scroll lock
**Solution**: 800ms `scrollLockDuration`

### Issue 2: Flickering at Boundaries

**Symptom**: Card rapidly switches back and forth
**Cause**: No hysteresis
**Solution**: 0.12 (12%) threshold

### Issue 3: First/Last Card Unequal Scroll

**Symptom**: First card takes forever, last card is instant
**Cause**: Equal thirds with equal hysteresis
**Solution**: Asymmetric zones (25%, 40%, 35%)

### Issue 4: Spacer Too Tall

**Symptom**: Scrolling forever to switch events
**Cause**: spacer height too large (250vh)
**Solution**: Reduced to 100vh

### Issue 5: Header Disappears

**Symptom**: "Outreach" title scrolls away
**Cause**: Not using `position: sticky`
**Solution**: Sticky header at `top: 80px`

---

## ✅ Success Metrics

This implementation achieves:

- ✅ All 3 events display reliably
- ✅ No skipping with momentum scrolling
- ✅ No flickering at zone boundaries
- ✅ Smooth 0.4s transitions
- ✅ Sticky header stays visible
- ✅ Mobile swipe support
- ✅ Background color transitions
- ✅ ~40% viewport scroll per event
- ✅ Professional, production-ready

---

## 🚀 Deployment

**Current Status**: ✅ Deployed to GitHub (commit ee1872a)
**Version**: v1.9.1
**Repository**: https://github.com/jacobB1290/MS.church
**Sandbox**: https://3000-iprrbc7u2mmhba4el56qt-0e616f0a.sandbox.novita.ai

---

**Document Version**: 1.0
**Last Updated**: November 6, 2025
**Author**: GenSpark AI Developer
