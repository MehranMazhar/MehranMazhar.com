#!/usr/bin/env python3
"""Assert every text/background colour pair used in the site meets WCAG AA (4.5:1).

Reads the tokens straight out of assets/css/style.css so it cannot drift from the
stylesheet. Run it after touching any colour token:

    python docs/check-contrast.py

Exits non-zero and prints the failing pairs if any combination drops below 4.5:1.
"""

import pathlib
import re
import sys

CSS = pathlib.Path(__file__).resolve().parent.parent / "assets" / "css" / "style.css"

# (text token, background token) pairs that actually occur in the stylesheet.
PAIRS = [
    ("ink", "bg"),
    ("ink", "surface"),
    ("ink", "surface-2"),
    ("ink-soft", "bg"),
    ("ink-soft", "surface"),
    ("ink-soft", "surface-2"),
    ("ink-mute", "bg"),
    ("ink-mute", "surface"),
    ("ink-mute", "surface-2"),
    ("accent", "bg"),
    ("accent", "surface"),
    ("accent", "surface-2"),
    ("accent", "accent-soft"),
    ("accent-ink", "accent-soft"),
]

# Literal colours used outside the token set: (label, text hex, background token).
LITERAL_PAIRS = [
    ("#fff on --accent", "#ffffff", "accent"),
    ("--mm-code .st on --surface", "#9a7b3a", "surface"),
]

AA = 4.5


def read_tokens(css: str) -> dict:
    """Pull `--name: #hex;` declarations out of the :root-equivalent block."""
    return {
        name: value
        for name, value in re.findall(r"--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,6})\s*;", css)
    }


def to_rgb(hex_colour: str) -> tuple:
    h = hex_colour.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def luminance(rgb: tuple) -> float:
    channels = []
    for value in rgb:
        c = value / 255
        channels.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    r, g, b = channels
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(fg: str, bg: str) -> float:
    light, dark = sorted((luminance(to_rgb(fg)), luminance(to_rgb(bg))), reverse=True)
    return (light + 0.05) / (dark + 0.05)


def main() -> int:
    tokens = read_tokens(CSS.read_text(encoding="utf-8"))

    checks = [(f"--{fg} on --{bg}", tokens.get(fg), tokens.get(bg)) for fg, bg in PAIRS]
    checks += [
        (label, fg, tokens.get(bg)) for label, fg, bg in LITERAL_PAIRS
    ]

    missing = [label for label, fg, bg in checks if not fg or not bg]
    if missing:
        print("Token not found in style.css:", ", ".join(missing))
        return 2

    failures = []
    for label, fg, bg in checks:
        value = ratio(fg, bg)
        status = "ok  " if value >= AA else "FAIL"
        if value < AA:
            failures.append(label)
        print(f"{status} {value:5.2f}:1  {label}  ({fg} on {bg})")

    if failures:
        print(f"\n{len(failures)} pair(s) below {AA}:1 — {', '.join(failures)}")
        return 1

    print(f"\nAll {len(checks)} pairs meet {AA}:1.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
