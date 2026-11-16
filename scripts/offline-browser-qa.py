#!/usr/bin/env python3
"""Exercise the built Starlight Academy HTML in offline Chrome/Edge."""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path

from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import sync_playwright

HTML_PATH = Path(os.environ.get("HTML_PATH", "dist/starlight-academy.html")).resolve()
BROWSER_CHANNEL = os.environ.get("BROWSER_CHANNEL", "chromium")
BROWSER_EXECUTABLE = os.environ.get("BROWSER_EXECUTABLE")
REQUIRE_FILE_URL = os.environ.get("REQUIRE_FILE_URL", "0") == "1"
STORAGE_KEY = "starlight-academy.save"

STORAGE_INIT = r"""
(() => {
  const values = new Map();
  const storage = {
    getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
    setItem(key, value) { values.set(String(key), String(value)); },
    removeItem(key) { values.delete(String(key)); },
    clear() { values.clear(); },
    key(index) { return Array.from(values.keys())[index] ?? null; },
    get length() { return values.size; }
  };
  Object.defineProperty(window, "localStorage", {
    configurable: true, enumerable: true, value: storage
  });
  window.__academyQASaveValues = values;
})();
"""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def click_button(page, label: str, *, index: int = 0) -> None:
    matches = page.locator("button:visible").filter(has_text=label)
    require(matches.count() > index, f'Visible button not found: "{label}"')
    print("  click " + label, flush=True)
    matches.nth(index).click(timeout=5_000)
    page.wait_for_timeout(150)


def install_storage_seed(context, serialized: str) -> None:
    seed = json.dumps(serialized)
    context.add_init_script(
        STORAGE_INIT
        + f"window.__academyQASaveValues.set({json.dumps(STORAGE_KEY)}, {seed});"
    )


def attach_diagnostics(page, browser_errors, console_errors, external_requests) -> None:
    page.on("pageerror", lambda error: browser_errors.append(str(error)))
    page.on("console", lambda message: console_errors.append(message.text)
            if message.type == "error" else None)
    page.on("request", lambda request: external_requests.append(request.url)
            if request.url.startswith(("http://", "https://")) else None)


def main() -> None:
    require(HTML_PATH.is_file(), f"Built HTML does not exist: {HTML_PATH}")
    html = HTML_PATH.read_text(encoding="utf-8")
    require(len(html) > 100_000, "The standalone HTML is unexpectedly small.")
    require("<script src=" not in html.lower(), "The HTML contains an external script reference.")
    require('rel="stylesheet"' not in html.lower(), "The HTML contains an external stylesheet reference.")
    require("Starlight Academy" in html, "The expected academy shell is missing from the build.")

    browser_errors: list[str] = []
    console_errors: list[str] = []
    external_requests: list[str] = []
    file_navigation_succeeded = False

    with sync_playwright() as playwright:
        launch_options = {
            "headless": True,
            "args": [
                "--no-sandbox", "--disable-dev-shm-usage",
                "--disable-background-networking", "--disable-component-update"
            ],
        }
        if BROWSER_EXECUTABLE:
            launch_options["executable_path"] = BROWSER_EXECUTABLE
        elif BROWSER_CHANNEL != "chromium":
            launch_options["channel"] = BROWSER_CHANNEL

        browser = playwright.chromium.launch(**launch_options)
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, offline=True)
        context.add_init_script(STORAGE_INIT)
        page = context.new_page()
        attach_diagnostics(page, browser_errors, console_errors, external_requests)

        # The release target is a double-clickable local HTML file. The model
        # host blocks file navigation, so local runs may use set_content; Windows
        # CI requires the actual file:// path to open successfully.
        try:
            page.goto(HTML_PATH.as_uri(), wait_until="domcontentloaded", timeout=20_000)
            file_navigation_succeeded = True
        except PlaywrightError as error:
            if REQUIRE_FILE_URL:
                raise AssertionError(
                    f"Local file navigation failed in {BROWSER_CHANNEL}: {error}"
                ) from error
            page.close()
            page = context.new_page()
            attach_diagnostics(page, browser_errors, console_errors, external_requests)
            page.set_content(html, wait_until="domcontentloaded", timeout=30_000)

        page.wait_for_timeout(500)
        require(page.title() == "Starlight Academy: Studio of Magic & Motion",
                "Academy document title did not render.")
        root = page.locator("#app")
        require(root.get_attribute("data-planned-chapters") == "10",
                "The browser build did not register ten chapters.")
        require(root.get_attribute("data-planned-quests") == "20",
                "The browser build did not register twenty optional quests.")
        require("Starlight Academy" in page.locator("body").inner_text(),
                "The academy shell did not render.")
        require("Chapters" in page.locator("body").inner_text(),
                "Chapter navigation is missing.")

        # Complete Chapter 1 through the real UI. Request a hint and safely skip
        # the remaining learning/challenge/movement activities.
        print("Browser loaded " + page.url, flush=True)
        click_button(page, "Begin adventure")
        require("A letter in the Lantern Tree" in page.locator("body").inner_text(),
                "Chapter 1 opening story did not appear.")
        click_button(page, "Continue the story")
        require("Follow the firefly stepping stones" in page.locator("body").inner_text(),
                "Chapter 1 learning activity did not appear.")
        click_button(page, "Ask Professor Hoot for a hint")
        hint_text = page.locator("body").inner_text()
        require("Professor Hoot's pattern clues" in hint_text and "Clue 1" in hint_text,
                "The first Professor Hoot hint stage was not presented.")
        click_button(page, "Skip this activity")
        click_button(page, "Skip this activity")
        require("Begin practice" in page.locator("body").inner_text(),
                "Gymnastics activity did not load.")
        click_button(page, "Skip this activity")
        require("The Lantern Tree awakens" in page.locator("body").inner_text(),
                "Chapter 1 closing story did not load.")
        click_button(page, "Continue the story")
        completion_text = page.locator("body").inner_text()
        require("Chapter complete!" in completion_text,
                "Chapter 1 did not complete in the browser.")
        require("40% this run" in completion_text and "0 stars" in completion_text,
                "Skipped activities did not produce the expected non-failing completion.")
        require("40" in completion_text and "Comet Dance Dress" in completion_text,
                "Chapter reward or wardrobe unlock was not reflected in the completion view.")

        # Quest unlocking, companion care, and wardrobe purchase.
        click_button(page, "Quests")
        quests_text = page.locator("body").inner_text()
        require("The Firefly Gap Maze" in quests_text and "The Moonberry Picnic Planner" in quests_text,
                "The first two optional quests are missing from the Quest Board.")
        require("Ready to begin" in quests_text,
                "Chapter 1 side quests did not unlock.")
        require("Complete Chapter 02 to unlock" in quests_text,
                "Chapter 2 quest gating is not shown.")

        click_button(page, "Pets")
        require("Pegasus" in page.locator("body").inner_text(),
                "Starter companion did not render.")
        click_button(page, "Give a treat")
        pet_text = page.locator("body").inner_text()
        require("Treat feeding · 25%" in pet_text
                and "Friendship 5 · Care moments 1" in pet_text,
                "Companion care did not update care and friendship progress.")

        click_button(page, "Wardrobe")
        require("Comet Dance Dress" in page.locator("body").inner_text(),
                "Chapter cosmetic was not unlocked in the wardrobe.")
        click_button(page, "Buy · 20 Star Gems")
        require("Star Gems 20" in page.locator("body").inner_text(),
                "Wardrobe purchase did not debit the catalog price.")
        # Let the autosave debounce finish and require an existing save before
        # testing the explicit replacement-confirmation path.
        page.wait_for_timeout(1_000)
        pre_import_save = page.evaluate(
            "(key) => window.__academyQASaveValues.get(key)", STORAGE_KEY
        )
        require(isinstance(pre_import_save, str) and pre_import_save,
                "The academy did not autosave before the backup import test.")

        # Settings, narration fallback, sound control, and JSON backup export/import.
        click_button(page, "Settings")
        settings_text = page.locator("body").inner_text()
        require("Academy settings" in settings_text and "Progress & backups" in settings_text,
                "Settings or progress backup controls did not render.")
        require("Read-aloud narration" in settings_text
                and "Every instruction is also shown on screen" in settings_text,
                "Narration's visible text fallback is missing.")
        preview_button = page.locator("button:visible").filter(has_text="Hear welcome sample").first
        if preview_button.is_enabled():
            click_button(page, "Hear welcome sample")
        else:
            require("No voice list is available" in settings_text
                    or "Narration is turned off" in settings_text,
                    "Unsupported narration did not retain its visible fallback.")
        click_button(page, "Mute sound")

        with page.expect_download(timeout=15_000) as download_info:
            click_button(page, "Export progress")
        download = download_info.value
        with tempfile.TemporaryDirectory() as temporary_directory:
            export_path = Path(temporary_directory) / "starlight-academy-backup.json"
            download.save_as(str(export_path))
            exported = json.loads(export_path.read_text(encoding="utf-8"))
            require(exported.get("format") == "starlight-academy-save",
                    "Exported backup has the wrong format identifier.")
            require(exported.get("state", {}).get("chapterRuntime", {}).get("chapters", {})
                    .get("chapter-01", {}).get("status") == "completed",
                    "Exported backup did not contain Chapter 1 completion.")
            with page.expect_file_chooser(timeout=10_000) as chooser_info:
                click_button(page, "Choose import file")
            chooser_info.value.set_files(str(export_path))
            page.wait_for_timeout(400)
            require("This backup is valid" in page.locator("body").inner_text(),
                    "Import preview/confirmation did not appear.")
            click_button(page, "Confirm replacing progress")
            require("Import" in page.locator("body").inner_text()
                    or "import" in page.locator("body").inner_text(),
                    "Import did not leave a visible confirmation/status message.")

        page.wait_for_timeout(1_000)
        saved_serialized = page.evaluate(
            "(key) => window.__academyQASaveValues.get(key)", STORAGE_KEY
        )
        require(isinstance(saved_serialized, str) and saved_serialized,
                "Autosave did not write browser save storage.")
        saved_envelope = json.loads(saved_serialized)
        saved_state = saved_envelope.get("state", {})
        require(saved_state.get("chapterRuntime", {}).get("chapters", {})
                .get("chapter-01", {}).get("status") == "completed",
                "Save storage did not preserve chapter completion.")
        require(saved_state.get("petCollection", {}).get("pets", {})
                .get("pet.pegasus", {}).get("careMoments") == 1,
                "Save storage did not preserve pet-care progress.")
        require("wardrobe.moonbeam-bow" in saved_state.get("wardrobe", {}).get("inventory", {}),
                "Save storage did not preserve the wardrobe purchase.")

        # Load the captured bytes in a fresh, isolated browser context.
        restored_context = browser.new_context(
            viewport={"width": 1440, "height": 1000}, offline=True
        )
        install_storage_seed(restored_context, saved_serialized)
        restored_page = restored_context.new_page()
        restored_errors: list[str] = []
        restored_page.on("pageerror", lambda error: restored_errors.append(str(error)))
        restored_page.set_content(html, wait_until="domcontentloaded", timeout=30_000)
        restored_page.wait_for_timeout(500)
        require(restored_page.locator("#app").get_attribute("data-planned-chapters") == "10",
                "Restored browser session did not finish initializing.")
        require("Star Gems 20" in restored_page.locator("body").inner_text(),
                "Currency did not survive browser restoration.")
        if restored_page.locator("button:visible").filter(has_text="Done").count():
            click_button(restored_page, "Done")
        click_button(restored_page, "Pets")
        restored_pet_text = restored_page.locator("body").inner_text()
        require("Treat feeding · 25%" in restored_pet_text
                and "Friendship 5 · Care moments 1" in restored_pet_text,
                "Pet care did not survive browser restoration.")
        click_button(restored_page, "Wardrobe")
        require("Moonbeam Bow" in restored_page.locator("body").inner_text(),
                "Purchased cosmetic did not survive browser restoration.")
        click_button(restored_page, "Quests")
        restored_quest_text = restored_page.locator("body").inner_text()
        require("The Firefly Gap Maze" in restored_quest_text
                and "Ready to begin" in restored_quest_text,
                "Quest unlock state did not survive browser restoration.")

        require(not browser_errors, "Uncaught browser errors: " + " | ".join(browser_errors))
        require(not restored_errors, "Uncaught errors after restore: " + " | ".join(restored_errors))
        require(not console_errors, "Browser console errors: " + " | ".join(console_errors[:10]))
        require(not external_requests,
                "Unexpected network requests while offline: " + " | ".join(external_requests))

        print(json.dumps({
            "browser": BROWSER_CHANNEL,
            "file_url_navigation": file_navigation_succeeded,
            "network_offline": True,
            "external_requests": len(external_requests),
            "uncaught_errors": len(browser_errors) + len(restored_errors),
            "console_errors": len(console_errors),
            "chapters_registered": 10,
            "quests_registered": 20,
            "chapter_1_completed": True,
            "hint_stage_rendered": 1,
            "pet_care_restored": True,
            "wardrobe_purchase_restored": True,
            "backup_export_import": True,
        }, indent=2))
        restored_context.close()
        context.close()
        browser.close()


if __name__ == "__main__":
    main()
