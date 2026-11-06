"use strict";

/* =========================================================
   ALI BIRTHDAY WEBSITE
   MAIN JAVASCRIPT
========================================================= */

/* 01 — HELPERS */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

const wait = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

let navigating = false;

const currentPage = (
    location.pathname.split("/").pop() || "index.html"
).toLowerCase();


/* 02 — MUSIC SYSTEM */

function getMusic() {
    if (currentPage === "birthday.html") {
        return $("#birthdayMusic") || $("#bgMusic");
    }

    return $("#bgMusic") || $("#birthdayMusic");
}

function prepareMusic() {
    [
        $("#bgMusic"),
        $("#birthdayMusic")
    ].filter(Boolean).forEach(audio => {
        audio.loop = true;
        audio.volume = 0.35;
        audio.preload = "auto";
    });
}

async function playMusic() {
    const activeTrack = getMusic();

    if (!activeTrack) return false;

    [
        $("#bgMusic"),
        $("#birthdayMusic")
    ].filter(Boolean).forEach(audio => {
        if (audio !== activeTrack) {
            audio.pause();
        }
    });

    try {
        await activeTrack.play();
        return true;
    } catch (error) {
        console.info("Music playback unavailable:", error);
        return false;
    }
}


/* 03 — REVEAL SYSTEM */

function reveal(element) {
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
}

function conceal(element) {
    if (!element) return;

    element.classList.remove(
        "active",
        "show",
        "visible",
        "revealed",
        "is-visible",
        "transition-in"
    );

    element.hidden = true;
    element.setAttribute("aria-hidden", "true");
}

function scrollToElement(element) {
    if (!element) return;

    element.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center"
    });
}


/* 04 — LOADING SCREEN */

function setupLoader() {
    const loader = $(
        "#loadingScreen, .loading-screen, .loader-screen"
    );

    if (!loader) return;

    function hideLoader() {
        loader.classList.add("loaded", "is-hidden");
        loader.style.pointerEvents = "none";

        setTimeout(() => {
            loader.classList.add("hidden");
            loader.setAttribute("aria-hidden", "true");
        }, reducedMotion ? 0 : 700);
    }

    if (document.readyState === "complete") {
        hideLoader();
    } else {
        window.addEventListener("load", hideLoader, {
            once: true
        });
    }
}


/* 05 — PAGE TRANSITIONS */

function getTransitionOverlay() {
    if (currentPage === "birthday.html") {
        return $("#birthdayTransition, .page-transition");
    }

    if (currentPage === "final.html") {
        return $("#finalTransition, .page-transition");
    }

    return $(".page-transition");
}

async function navigateTo(destination) {
    if (!destination || navigating) return;

    navigating = true;

    const overlay = getTransitionOverlay();

    document.body.classList.add(
        "page-leaving",
        "is-transitioning"
    );

    if (overlay) {
        reveal(overlay);
        overlay.classList.add("transition-in");
    }

    await wait(reducedMotion ? 0 : 450);

    location.href = destination;
}


/* 06 — GIFT OPENING — FIXED */

function setupGiftOpening() {

    const openButton = $("#openSurprise");

    if (!openButton) {
        console.error("Open Surprise button not found!");
        return;
    }

    openButton.addEventListener("click", async () => {

        if (openButton.dataset.opened === "true") {
            return;
        }

        openButton.dataset.opened = "true";
        openButton.disabled = true;

        // Music starts independently.
        // Gift animation does not wait for music.
        playMusic();

        try {

            const giftStage = $(
                "#giftStage, .gift-stage"
            );

            const giftBox = $(
                "#giftBox, .gift-box-3d, .gift-box"
            );

            const giftLid = $(
                "#giftLid, .box-lid, .gift-lid"
            );

            // Start the gift animation.
            document.body.classList.add("gift-opening");

            [
                giftStage,
                giftBox,
                giftLid
            ].filter(Boolean).forEach(element => {

                element.classList.add(
                    "opening",
                    "is-opening",
                    "opened"
                );

            });

            const mystery = $(".mystery-message");

            if (mystery) {
                mystery.classList.add("fade-out");
            }

            // Wait for the gift animation.
            await wait(reducedMotion ? 0 : 1200);

            // Find the next reveal section.
            const revealSection = $(
                "#cinematicReveal, .cinematic-reveal"
            );

            if (!revealSection) {
                throw new Error(
                    "Cinematic reveal section not found!"
                );
            }

            // Reveal the next section.
            reveal(revealSection);

            document.body.classList.add(
                "cinematic-revealed"
            );

            scrollToElement(revealSection);

            // Flash effect.
            const flash = $(
                "#screenFlash, #flashOverlay, .flash-overlay"
            );

            if (flash) {

                flash.classList.add("active");

                await wait(reducedMotion ? 0 : 180);

                flash.classList.remove("active");
            }

            // Enable the next button.
            const continueButton = $("#continueButton");

            if (continueButton) {
                continueButton.disabled = false;
            }

            openButton.textContent = "Surprise opened ♡";

        } catch (error) {

            console.error("Gift opening error:", error);

            openButton.disabled = false;
            openButton.dataset.opened = "false";

        }

    });
}


/* 07 — BIRTHDAY SECRET MESSAGE */

function setupBirthdaySecret() {

    const button = $("#birthdaySecret");
    const message = $("#birthdaySecretMessage");

    if (!button || !message) return;

    message.hidden = true;
    message.setAttribute("aria-hidden", "true");

    button.setAttribute("aria-expanded", "false");

    button.addEventListener("click", async () => {

        // Music must not block the reveal.
        playMusic();

        const isOpen =
            button.getAttribute("aria-expanded") === "true";

        if (isOpen) {

            conceal(message);

            button.setAttribute("aria-expanded", "false");
            button.classList.remove("active");

        } else {

            reveal(message);

            button.setAttribute("aria-expanded", "true");
            button.classList.add("active");

            scrollToElement(message);
        }
    });
}


/* 08 — FINAL SECRET MESSAGE */

function setupFinalReveal() {

    const button = $("#finalReveal");
    const message = $("#finalSecretMessage");

    if (!button || !message) return;

    // New final.html already has its own reveal handler.
    if (message.classList.contains("final-reveal-card")) {
        return;
    }

    message.hidden = true;
    message.setAttribute("aria-hidden", "true");

    button.setAttribute("aria-expanded", "false");

    button.addEventListener("click", () => {

        playMusic();

        const isOpen =
            button.getAttribute("aria-expanded") === "true";

        if (isOpen) {

            conceal(message);

            button.setAttribute("aria-expanded", "false");
            button.classList.remove("active");

        } else {

            reveal(message);

            button.setAttribute("aria-expanded", "true");
            button.classList.add("active");

            scrollToElement(message);
        }
    });
}


/* 09 — MAIN PAGE BUTTONS */

function setupPageButtons() {

    $("#continueButton")?.addEventListener(
        "click",
        () => navigateTo("birthday.html")
    );

    $("#birthdayNext")?.addEventListener(
        "click",
        () => navigateTo("letter.html")
    );

    $("#worldNext")?.addEventListener(
        "click",
        () => navigateTo("memories.html")
    );

    $("#memoriesNext")?.addEventListener(
        "click",
        () => navigateTo("universe.html")
    );

    $("#universeNext")?.addEventListener(
        "click",
        () => navigateTo("final.html")
    );

    $$("#replayButton, .replay-button, [data-replay]")
        .forEach(button => {

            button.addEventListener("click", event => {
                event.preventDefault();
                navigateTo("index.html");
            });

        });

    $$("[data-next]").forEach(button => {

        button.addEventListener("click", () => {

            const destination =
                button.getAttribute("data-next");

            if (destination) {
                navigateTo(destination);
            }

        });

    });
}


/* 10 — INTERNAL PAGE LINKS */

function setupInternalNavigation() {

    $$("a[href]").forEach(anchor => {

        anchor.addEventListener("click", event => {

            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey ||
                (anchor.target && anchor.target !== "_self") ||
                anchor.hasAttribute("download")
            ) {
                return;
            }

            const href = anchor.getAttribute("href");

            if (
                !href ||
                href.startsWith("#") ||
                /^(mailto:|tel:|javascript:)/i.test(href)
            ) {
                return;
            }

            let destination;

            try {
                destination = new URL(href, location.href);
            } catch {
                return;
            }

            if (
                destination.origin !== location.origin ||
                !/\.html?$/i.test(destination.pathname) ||
                destination.href === location.href
            ) {
                return;
            }

            event.preventDefault();

            navigateTo(destination.href);

        });

    });
}


/* 11 — MUSIC TOGGLE BUTTON */

function setupMusicToggle() {

    const buttons = $$(
        "#musicToggle, .music-toggle, [data-music-toggle]"
    );

    buttons.forEach(button => {

        button.setAttribute("aria-pressed", "false");

        button.addEventListener("click", async () => {

            const audio = getMusic();

            if (!audio) return;

            if (audio.paused) {

                const playing = await playMusic();

                button.setAttribute(
                    "aria-pressed",
                    String(playing)
                );

                button.classList.toggle(
                    "playing",
                    playing
                );

            } else {

                audio.pause();

                button.setAttribute("aria-pressed", "false");

                button.classList.remove("playing");
            }

        });

    });
}


/* 12 — BUTTON DEFAULTS */

function setupButtonDefaults() {

    $$("button").forEach(button => {

        if (!button.hasAttribute("type")) {
            button.type = "button";
        }

    });
}


/* 13 — ACCESSIBILITY */

function setupAccessibility() {

    if (reducedMotion) {
        document.documentElement.classList.add(
            "reduce-motion"
        );
    }
}


/* 14 — INITIALIZE WEBSITE */

function initializeWebsite() {

    prepareMusic();

    setupLoader();

    setupGiftOpening();

    setupBirthdaySecret();

    setupFinalReveal();

    setupPageButtons();

    setupInternalNavigation();

    setupMusicToggle();

    setupButtonDefaults();

    setupAccessibility();

    console.log(
        "ALI BIRTHDAY WEBSITE READY:",
        currentPage
    );
}


/* 15 — START */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeWebsite,
        { once: true }
    );

} else {

    initializeWebsite();

}
