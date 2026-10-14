---
title: VacuumClone
dates: Dec 2025
details: Swift, SwiftUI, AppKit
summary: A native macOS utility built in Swift that gives users a simple free “quit all apps” button.
order: 3
---
> *Ever wish you had a ‘quit all apps’ button on macOS?*

Not really... but some guy charged 4 dollars (Canadian) for it and got downvoted into oblivion on Reddit.

I don't often end up with 10+ apps open after a work session. Closing them one by one or right-clicking Dock icons was not really tedious. But someone thought it was, and charged money for it. So I built VacuumClone: a clone of that guy's app, except it doesn't cost you 4 dollars.

## Why I Built It

- **Speed:** well, it's not that much faster than ⌘Q (it might be slower).
- **Focus:** ~~Uhhh, how does it give you focus?~~ It can quit all your apps to give you focus, including the ones you were focusing on.
- **Native design:** it's written in Swift. I'd be concerned if it wasn't native.
- **No subscriptions:** it's on GitHub and you don't have to pay.
- **Real reason:** that guy's scamming.

It took about a day, from first commit to [posting it on r/MacOS](https://www.reddit.com/r/MacOS/comments/1pe3r3f/ever_wish_you_had_a_quit_all_apps_button_on_macos/).

![VacuumClone's menu bar popover listing open apps with checkboxes](/assets/projects/vacuum-clone/popover.png "Vacuum Clone"){: .small}
![VacuumClone settings popover with Start at Login and the safe list](/assets/projects/vacuum-clone/settings.webp "Settings"){: .small}

The app lives in the menu bar. Settings has Start at Login and the safe list; Finder is locked by default.
{: .caption}

## What It Does

Click the wind icon in the menu bar and a popover lists your open apps. Pick the ones to get rid of (or Select All), hit Clean, and you get a "Mmm! Cleaned!" animation and the macOS "Blow" sound.

- **Keyboard first:** ⌘F to search, ⌘A to select all, Enter to clean.
- **Safe list:** lock apps so they're never selected. Finder and the Dock are locked by default, and the list survives restarts.
- **Live list:** it updates as apps open and quit.
- **Start at login:** one toggle in settings.
- **Quits politely:** it asks each app to quit instead of force-killing it, so anything with unsaved work still shows its save prompt.

It needs macOS 14.6 or later.

## The Icon

As you may have noticed, the icon is absolutely terrible. I don't know how to design icons, and it was put together in 30 minutes in Figma and Icon Composer.

> **Q:** Have you-
>
> **A:** No, I have not studied colour theory, or art in general. How did you tell?

## Links

[View the GitHub repository](https://github.com/say-no-to-sleep/VacuumClone)
