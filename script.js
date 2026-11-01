
/* =========================================================
   ALI BIRTHDAY WEBSITE — MASTER SCRIPT
   Works with all 7 HTML pages
========================================================= */

"use strict";

/* =========================================================
   01. HELPERS
========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

const wait = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

let navigationStarted = false;

const currentPage = (
    window.location.pathname.split("/").pop() || "index.html"
).toLowerCase();


/* =========================================================
   02. MUSIC SYSTEM
========================================================= */

function getPageMusic() {
    if (currentPage === "birthday.html") {
        return $("#birthdayMusic") || $("#bgMusic");
    }

    return $("#bgMusic") || $("#birthdayMusic");
}

function prepareMusic() {
    [$("#bgMusic"), $("#birthdayMusic")]
        .filter(Boolean)
        .forEach(audio => {
            audio.loop = true;
            audio.volume = 0.35;
            audio.preload = "auto";
        });
}

function pauseOtherMusic(activeAudio) {
    [$("#bgMusic"), $("#birthdayMusic")]
        .filter(Boolean)
        .forEach(audio => {
            if (audio !== activeAudio) audio.pause();
        });
}

async function playMusic() {
    const audio = getPageMusic();

    if (!audio) return false;

    pauseOtherMusic(audio);

    try {
        await audio.play();
        return true;
    } catch (error) {
        console.info("Music could not start yet.");
        return false;
    }
}


/* =========================================================
   03. LOADING SCREEN
========================================================= */

function handleLoadingScreen() {
    const loader = $(
        "#loadingScreen, .loading-screen, .loader-screen"
    );

    if (!loader) return;

    let alreadyHidden = false;

    function hideLoader() {
        if (alreadyHidden) return;
        alreadyHidden = true;

        loader.classList.add("loaded", "is-hidden");

        if (loader.id === "loadingScreen") {
            loader.style.pointerEvents = "none";
        }

        wait(prefersReducedMotion ? 0 : 800).then(() => {
            loader.classList.add("hidden");
            loader.setAttribute("aria-hidden", "true");
        });
    }

    if (document.readyState === "complete") {
        hideLoader();
    } else {
        window.addEventListener("load", hideLoader, {
            once: true
        });
    }
}


/* =========================================================
   04. REVEAL HELPERS
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
   05. GIFT OPENING — INDEX PAGE
========================================================= */

function setupGiftOpening() {
    const openButton = $("#openSurprise");

    const giftStage = $("#giftStage, .gift-stage");

    const giftBox = $("#giftBox, .gift-box-3d, .gift-box");

    const giftLid = $("#giftLid, .box-lid, .gift-lid");

    const mysteryMessage = $(".mystery-message");

    const cinematicReveal = $("#cinematicReveal");

    const continueButton = $("#continueButton");

    const flash = $("#screenFlash, #flashOverlay, .flash-overlay");

    if (!openButton) return;

    openButton.addEventListener("click", async () => {
        if (openButton.dataset.opened === "true") return;

        openButton.dataset.opened = "true";
        openButton.disabled = true;

        await playMusic();

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

        if (mysteryMessage) {
            mysteryMessage.classList.add("fade-out");
        }

        openButton.classList.add("button-used");

        await wait(prefersReducedMotion ? 0 : 1100);

        if (cinematicReveal) {
            revealElement(cinematicReveal);
            scrollToElement(cinematicReveal);
        }

        document.body.classList.add("cinematic-revealed");

        if (flash) {
            flash.classList.add("active");

            await wait(prefersReducedMotion ? 0 : 180);

            flash.classList.remove("active");
        }

        if (continueButton) {
            continueButton.disabled = false;

            continueButton.setAttribute(
                "aria-label",
                "Continue to the birthday page"
            );
        }
    });
}


/* =========================================================
   06. CONTINUE BUTTON
========================================================= */

function setupContinueButton() {
    const button = $("#continueButton");

    if (!button) return;

    button.addEventListener("click", () => {
        transitionTo("birthday.html");
    });
}


/* =========================================================
   07. PAGE TRANSITIONS
========================================================= */

function getTransitionOverlay() {
    if (currentPage === "birthday.html") {
        return $("#birthdayTransition, #pageTransition, .page-transition");
    }

    if (currentPage === "final.html") {
        return $("#finalTransition, #pageTransition, .page-transition");
    }

    return $(
        "#pageTransition, .page-transition, #finalTransition, #birthdayTransition"
    );
}

async function transitionTo(destination) {
    if (!destination || navigationStarted) return;

    navigationStarted = true;

    const overlay = getTransitionOverlay();

    document.body.classList.add(
        "page-leaving",
        "is-transitioning"
    );

    if (overlay) {
        revealElement(overlay);
        overlay.classList.add("transition-in");
    }

    await wait(prefersReducedMotion ? 0 : 550);

    window.location.href = destination;
}


/* =========================================================
   08. INTERNAL PAGE LINKS
========================================================= */

function setupInternalLinks() {
    $$("a[href]").forEach(link => {
        link.addEventListener("click", event => {
            if (event.defaultPrevented) return;
            if (event.button !== 0) return;

            if (
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey
            ) return;

            if (link.target && link.target !== "_self") return;
            if (link.hasAttribute("download")) return;

            const href = link.getAttribute("href");

            if (!href || href.startsWith("#")) return;

            if (/^(mailto:|tel:|javascript:)/i.test(href)) {
                return;
            }

            let destination;

            try {
                destination = new URL(href, window.location.href);
            } catch {
                return;
            }

            if (destination.origin !== window.location.origin) {
                return;
            }

            if (!/\.html?$/i.test(destination.pathname)) return;

            if (destination.href === window.location.href) return;

            event.preventDefault();

            transitionTo(destination.href);
        });
    });
}


/* =========================================================
   09. BIRTHDAY SECRET MESSAGE
========================================================= */

function setupBirthdaySecret() {
    const button = $("#birthdaySecret");
    const message = $("#birthdaySecretMessage");

    if (!button || !message) return;

    message.hidden = true;
    message.setAttribute("aria-hidden", "true");

    button.setAttribute("aria-expanded", "false");

    button.addEventListener("click", async () => {
        await playMusic();

        const isOpen =
            button.getAttribute("aria-expanded") === "true";

        if (isOpen) {
            hideElement(message);

            button.setAttribute("aria-expanded", "false");
            button.classList.remove("active");
        } else {
            revealElement(message);

            button.setAttribute("aria-expanded", "true");
            button.classList.add("active");

            scrollToElement(message);
        }
    });
}


/* =========================================================
   10. BIRTHDAY NEXT BUTTON
========================================================= */

function setupBirthdayNext() {
    const button = $("#birthdayNext");

    if (!button) return;

    button.addEventListener("click", () => {
        transitionTo("letter.html");
    });
}


/* =========================================================
   11. FINAL SECRET MESSAGE
========================================================= */

function setupFinalSecret() {
    const button = $("#finalReveal");
    const message = $("#finalSecretMessage");

    if (!button || !message) return;

    message.hidden = true;
    message.setAttribute("aria-hidden", "true");

    button.setAttribute("aria-expanded", "false");

    button.addEventListener("click", async () => {
        await playMusic();

        const isOpen =
            button.getAttribute("aria-expanded") === "true";

        if (isOpen) {
            hideElement(message);

            button.setAttribute("aria-expanded", "false");
            button.classList.remove("active");
        } else {
            revealElement(message);

            button.setAttribute("aria-expanded", "true");
            button.classList.add("active");

            scrollToElement(message);
        }
    });
}


/* =========================================================
   12. REPLAY WEBSITE
========================================================= */

function setupReplay() {
    const buttons = $$(
        "#replayButton, .replay-button, [data-replay]"
    );

    buttons.forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            transitionTo("index.html");
        });
    });
}


/* =========================================================
   13. ACCESSIBILITY
========================================================= */

function setupAccessibility() {
    $$("button").forEach(button => {
        if (!button.hasAttribute("type")) {
            button.type = "button";
        }
    });

    if (prefersReducedMotion) {
        document.documentElement.classList.add("reduce-motion");
    }

    $$("[hidden]").forEach(element => {
        element.setAttribute("aria-hidden", "true");
    });
}


/* =========================================================
   14. OPTIONAL MUSIC TOGGLE
========================================================= */

function setupMusicToggle() {
    const buttons = $$(
        "#musicToggle, .music-toggle, [data-music-toggle]"
    );

    buttons.forEach(button => {
        button.setAttribute("aria-pressed", "false");

        button.addEventListener("click", async () => {
            const audio = getPageMusic();

            if (!audio) return;

            if (audio.paused) {
                const started = await playMusic();

                button.setAttribute(
                    "aria-pressed",
                    String(started)
                );

                button.classList.toggle("playing", started);
            } else {
                audio.pause();

                button.setAttribute("aria-pressed", "false");
                button.classList.remove("playing");
            }
        });
    });
}


/* =========================================================
   15. OPTIONAL DATA NAVIGATION
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
   16. INITIALIZE WEBSITE
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
        currentPage
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
