
/* =========================================================
   ALI BIRTHDAY WEBSITE — MASTER SCRIPT
   Works with:
   index.html
   birthday.html
   letter.html
   our-world.html
   memories.html
   universe.html
   final.html

   Features:
   1. Loading screen
   2. 3D gift opening
   3. Cinematic reveal
   4. Background music
   5. Birthday secret
   6. Final secret
   7. Smooth page transitions
   8. Next-page navigation
   9. Replay website
   10. Safe handling of missing elements
========================================================= */

"use strict";

/* =========================================================
   01. HELPER FUNCTIONS
========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

const wait = (milliseconds) =>
    new Promise(resolve => setTimeout(resolve, milliseconds));

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

let navigationStarted = false;


/* =========================================================
   02. CURRENT PAGE
========================================================= */

function getCurrentPage() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf("/") + 1).toLowerCase();
}

const currentPage = getCurrentPage();


/* =========================================================
   03. MUSIC SYSTEM
========================================================= */

function getPageMusic() {
    if (currentPage === "birthday.html") {
        return $("#birthdayMusic") || $("#bgMusic");
    }

    return $("#bgMusic") || $("#birthdayMusic");
}

function prepareMusic() {
    const audioElements = [
        $("#bgMusic"),
        $("#birthdayMusic")
    ].filter(Boolean);

    audioElements.forEach(audio => {
        audio.loop = true;
        audio.volume = 0.35;
        audio.preload = "auto";
    });
}

async function playMusic() {
    const audio = getPageMusic();

    if (!audio) return;

    try {
        const result = audio.play();

        if (result && typeof result.then === "function") {
            await result;
        }
    } catch (error) {
        // Browsers may block playback or the audio file may be missing.
        // Music can be started again after another user interaction.
        console.info("Music could not start yet.");
    }
}

function pauseOtherMusic(activeAudio) {
    [$("#bgMusic"), $("#birthdayMusic")]
        .filter(Boolean)
        .forEach(audio => {
            if (audio !== activeAudio) {
                audio.pause();
            }
        });
}


/* =========================================================
   04. LOADING SCREEN
========================================================= */

function handleLoadingScreen() {
    const loadingScreen = $(
        "#loadingScreen, .loading-screen, .loader-screen"
    );

    if (!loadingScreen) return;

    const hideLoader = () => {
        loadingScreen.classList.add("loaded", "is-hidden");

        if (loadingScreen.id === "loadingScreen") {
            loadingScreen.style.pointerEvents = "none";
        }

        wait(prefersReducedMotion ? 0 : 800).then(() => {
            loadingScreen.classList.add("hidden");
            loadingScreen.setAttribute("aria-hidden", "true");
        });
    };

    if (document.readyState === "complete") {
        hideLoader();
    } else {
        window.addEventListener("load", hideLoader, { once: true });
    }
}


/* =========================================================
   05. CINEMATIC REVEAL HELPERS
========================================================= */

function revealElement(element) {
    if (!element) return;

    element.hidden = false;
    element.removeAttribute("aria-hidden");

    element.classList.add(
        "active",
        "show",
        "visible",
        "revealed",
        "is-visible"
    );

    element.setAttribute("aria-live", "polite");
}

function hideElement(element) {
    if (!element) return;

    element.classList.remove(
        "active",
        "show",
        "visible",
        "revealed",
        "is-visible"
    );

    element.hidden = true;
    element.setAttribute("aria-hidden", "true");
}

function scrollToElement(element) {
    if (!element) return;

    element.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center"
    });
}


/* =========================================================
   06. 3D GIFT OPENING — INDEX PAGE
========================================================= */

function setupGiftOpening() {
    const openButton = $("#openSurprise");
    const giftStage = $(".gift-stage");
    const giftBox = $(".gift-box");

    const giftLid = $(
        ".gift-lid, .gift-box-lid, .box-lid"
    );

    const cinematicReveal = $("#cinematicReveal");
    const continueButton = $("#continueButton");

    if (!openButton) return;

    openButton.addEventListener("click", async () => {
        if (openButton.dataset.opened === "true") return;

        openButton.dataset.opened = "true";
        openButton.disabled = true;

        // Start music only after the visitor clicks.
        await playMusic();

        // Animate the present using available CSS classes.
        document.body.classList.add("gift-opening");

        if (giftStage) {
            giftStage.classList.add(
                "opening",
                "is-opening",
                "opened"
            );
        }

        if (giftBox) {
            giftBox.classList.add(
                "opening",
                "is-opening",
                "opened"
            );
        }

        if (giftLid) {
            giftLid.classList.add(
                "opening",
                "is-opening",
                "opened"
            );
        }

        openButton.classList.add("button-used");

        const mysteryText = $(
            ".mystery-text, .gift-message, .gift-instruction"
        );

        if (mysteryText) {
            mysteryText.classList.add("fade-out");
        }

        // Wait for the gift animation before the big reveal.
        await wait(prefersReducedMotion ? 0 : 1100);

        if (cinematicReveal) {
            revealElement(cinematicReveal);
            scrollToElement(cinematicReveal);
        }

        document.body.classList.add("cinematic-revealed");

        const flash = $(
            "#flashOverlay, .flash-overlay"
        );

        if (flash) {
            flash.classList.add("active");
            await wait(prefersReducedMotion ? 0 : 180);
            flash.classList.remove("active");
        }

        if (continueButton) {
            continueButton.disabled = false;
            continueButton.setAttribute("aria-label", "Continue to the birthday page");
        }
    });
}


/* =========================================================
   07. CONTINUE FROM THE OPENING PAGE
========================================================= */

function setupContinueButton() {
    const continueButton = $("#continueButton");

    if (!continueButton) return;

    continueButton.addEventListener("click", () => {
        transitionTo("birthday.html");
    });
}


/* =========================================================
   08. PAGE TRANSITION SYSTEM
========================================================= */

function getTransitionOverlay() {
    if (currentPage === "birthday.html") {
        return $("#birthdayTransition") ||
            $("#pageTransition") ||
            $(".page-transition");
    }

    if (currentPage === "final.html") {
        return $("#finalTransition") ||
            $("#pageTransition") ||
            $(".page-transition");
    }

    return $("#pageTransition") ||
        $(".page-transition") ||
        $("#finalTransition") ||
        $("#birthdayTransition");
}

async function transitionTo(destination) {
    if (!destination || navigationStarted) return;

    navigationStarted = true;

    const overlay = getTransitionOverlay();

    document.body.classList.add("page-leaving", "is-transitioning");

    if (overlay) {
        revealElement(overlay);
        overlay.classList.add("transition-in");
    }

    await wait(prefersReducedMotion ? 0 : 550);

    window.location.href = destination;
}


/* =========================================================
   09. ALL INTERNAL HTML LINKS
========================================================= */

function setupInternalLinks() {
    $$("a[href]").forEach(link => {
        link.addEventListener("click", event => {
            if (event.defaultPrevented) return;
            if (event.button !== 0) return;
            if (event.ctrlKey || event.metaKey ||
                event.shiftKey || event.altKey) return;

            if (link.target && link.target !== "_self") return;
            if (link.hasAttribute("download")) return;

            const href = link.getAttribute("href");

            if (!href || href.startsWith("#")) return;
            if (/^(mailto:|tel:|javascript:)/i.test(href)) return;

            let destination;

            try {
                destination = new URL(href, window.location.href);
            } catch {
                return;
            }

            // Only handle links that point to this same website.
            if (destination.origin !== window.location.origin) return;

            if (!/\.html?$/i.test(destination.pathname)) return;

            // Allow normal browser navigation for the current page.
            if (destination.href === window.location.href) return;

            event.preventDefault();
            transitionTo(destination.href);
        });
    });
}


/* =========================================================
   10. BIRTHDAY PAGE — SECRET MESSAGE
========================================================= */

function setupBirthdaySecret() {
    const secretButton = $("#birthdaySecret");
    const secretMessage = $("#birthdaySecretMessage");

    if (!secretButton || !secretMessage) return;

    // Support both a hidden attribute and CSS-hidden messages.
    secretMessage.hidden = true;
    secretMessage.setAttribute("aria-hidden", "true");

    secretButton.setAttribute("aria-expanded", "false");

    secretButton.addEventListener("click", async () => {
        await playMusic();

        const isOpen =
            secretButton.getAttribute("aria-expanded") === "true";

        if (isOpen) {
            hideElement(secretMessage);
            secretButton.setAttribute("aria-expanded", "false");
            secretButton.classList.remove("active");
        } else {
            revealElement(secretMessage);
            secretButton.setAttribute("aria-expanded", "true");
            secretButton.classList.add("active");

            scrollToElement(secretMessage);
        }
    });
}


/* =========================================================
   11. BIRTHDAY PAGE — NEXT BUTTON
========================================================= */

function setupBirthdayNext() {
    const nextButton = $("#birthdayNext");

    if (!nextButton) return;

    nextButton.addEventListener("click", () => {
        transitionTo("letter.html");
    });
}


/* =========================================================
   12. FINAL PAGE — SECRET MESSAGE
========================================================= */

function setupFinalSecret() {
    const secretButton = $("#finalReveal");
    const secretMessage = $("#finalSecretMessage");

    if (!secretButton || !secretMessage) return;

    secretMessage.hidden = true;
    secretMessage.setAttribute("aria-hidden", "true");

    secretButton.setAttribute("aria-expanded", "false");

    secretButton.addEventListener("click", async () => {
        await playMusic();

        const isOpen =
            secretButton.getAttribute("aria-expanded") === "true";

        if (isOpen) {
            hideElement(secretMessage);
            secretButton.setAttribute("aria-expanded", "false");
            secretButton.classList.remove("active");
        } else {
            revealElement(secretMessage);
            secretButton.setAttribute("aria-expanded", "true");
            secretButton.classList.add("active");

            scrollToElement(secretMessage);
        }
    });
}


/* =========================================================
   13. REPLAY WEBSITE
========================================================= */

function setupReplay() {
    const replayButtons = $$(
        "#replayButton, .replay-button, [data-replay]"
    );

    replayButtons.forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            transitionTo("index.html");
        });
    });

    // A normal link with href="index.html" also works
    // through the internal-link transition handler.
}


/* =========================================================
   14. ACCESSIBILITY AND BUTTON SAFETY
========================================================= */

function setupAccessibility() {
    // Give buttons a default type so they do not accidentally
    // submit a form when placed inside one.
    $$("button").forEach(button => {
        if (!button.hasAttribute("type")) {
            button.type = "button";
        }
    });

    // Respect reduced-motion settings.
    if (prefersReducedMotion) {
        document.documentElement.classList.add("reduce-motion");
    }

    // Make all existing page sections easier for screen readers
    // when they are marked as hidden.
    $$("[hidden]").forEach(element => {
        element.setAttribute("aria-hidden", "true");
    });
}


/* =========================================================
   15. OPTIONAL MUSIC BUTTON
========================================================= */

function setupMusicToggle() {
    const musicButtons = $$(
        "#musicToggle, .music-toggle, [data-music-toggle]"
    );

    musicButtons.forEach(button => {
        button.setAttribute("aria-pressed", "false");

        button.addEventListener("click", async () => {
            const audio = getPageMusic();

            if (!audio) return;

            if (audio.paused) {
                await playMusic();

                if (!audio.paused) {
                    button.setAttribute("aria-pressed", "true");
                    button.classList.add("playing");
                }
            } else {
                audio.pause();
                button.setAttribute("aria-pressed", "false");
                button.classList.remove("playing");
            }
        });
    });
}


/* =========================================================
   16. OPTIONAL NEXT-BUTTON SUPPORT
   Use data-next="letter.html" on any extra button if needed.
========================================================= */

function setupDataNavigation() {
    $$("[data-next]").forEach(button => {
        button.addEventListener("click", () => {
            const destination = button.getAttribute("data-next");

            if (destination) {
                transitionTo(destination);
            }
        });
    });
}


/* =========================================================
   17. START EVERYTHING
========================================================= */

function initializeWebsite() {
    prepareMusic();
    handleLoadingScreen();

    setupGiftOpening();
    setupContinueButton();

    setupBirthdaySecret();
    setupBirthdayNext();

    setupFinalSecret();
    setupReplay();

    setupInternalLinks();
    setupAccessibility();
    setupMusicToggle();
    setupDataNavigation();

    console.log(
        "ALI BIRTHDAY WEBSITE READY —",
        currentPage || "index.html"
    );
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeWebsite,
        { once: true }
    );
} else {
    initializeWebsite();
}

/* =========================================================
   END OF MASTER SCRIPT
========================================================= */
