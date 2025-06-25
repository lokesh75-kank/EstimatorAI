AI-Driven Vendor Discovery – UI/UX Implementation Guide

Below is a detailed, non-code guide for integrating the AI-powered vendor sourcing experience into your project page. It covers placement, states, feedback patterns, and interaction flows to ensure clarity, consistency, and usability.

1. Placement & Entry
Contextual Location
Position the Vendor Discovery section immediately below the Requirements upload area and above any free-form notes or manual override controls. This ensures users see sourcing progress before moving on.

Visibility
Always reserve vertical space for this section (even in loading or error states) so the page layout doesn’t shift dramatically.

2. Entry State: Auto-Trigger
Automatic Kickoff
As soon as the user completes key project fields (address/ZIP + building type), silently start the vendor discovery process. No button press is required.

Gentle Onboarding
If this is the user’s first project, display a one-time tooltip or inline callout explaining:

“AI is now discovering vendor catalogs for you—no manual setup needed!”

3. Loading / Progress State
Progress Banner

Appearance: A horizontal banner with light-blue background and rounded corners.

Icon + Text: Left-aligned spinner icon followed by descriptive text, for example:
“Vendor Sourcing: finding best prices for smoke detectors…”

Intermediate Updates: If feasible, update the text to reflect sub-steps (“Connecting to Graybar…”, “Fallback scraping…”).

Non-Blocking UX

Allow scrolling below the fold.

Keep “Create & Estimate” button disabled until sourcing completes or errors out; disable only the final action, not the entire page.

4. Success / Preview State
Section Header

Display an AI icon (🤖) next to the title “AI-Sourced Sample SKUs”.

Sample Table / Grid

Show 3–5 rows with columns: Code, Description, Unit Price, Vendor Name.

Use alternating row background colors for readability.

Render vendor names as badges with subtle outline styling.

Contextual Tooltip

Hover on a vendor badge shows “Sourced via Graybar API” or “From fallback CSV feed”.

“Refresh Samples” Control

A small link at the bottom-right: “Refresh samples” to manually re-trigger the fetch.

5. Error State
Error Banner Replacement

Replace the progress banner with a red-tinted callout.

Include an error icon and message like:
“Vendor sourcing failed. Please check your network or configure a manual source.”

Provide two buttons: “Retry” and “Configure Manual Source”.

Persistent Guidance

Keep the sample panel visible in a “Notes” collapsed state, so users know where sampling would appear once fixed.

6. Manual Override Link
Inline Link

Below the sample preview (or error callout), add a small text link:
“Configure manual connectors” → opens Data Sources drawer/page.

Styling

Use underlined text with your brand’s link color.

On hover, highlight subtly with background or icon.

7. Animation & Feedback
Banner Entrance

Fade-in + slide down when sourcing begins.

Banner Exit

Fade-out + slide up when sourcing completes or errors.

Table Load

Show 3 skeleton rows in the table before data arrives.

Badge Hover

Slight scale-up and shadow to indicate interactivity.

8. Accessibility & Responsiveness
ARIA Roles

Mark the progress banner as role="status" so screen readers announce updates.

Ensure error callout is role="alert" for immediate notification.

Keyboard Navigation

“Refresh samples” and “Configure manual connectors” must be focusable links.

Allow Escape key to collapse any expanded notes.

Mobile Adaptation

Stack banner and preview in a single column.

Convert table into an accordion list where each SKU card shows details on expand.

9. Summary of User Flow
User fills project details → agent auto-triggers sourcing.

Progress banner appears, updating as needed.

On success: banner transitions to preview table.

On error: error callout with retry and manual-config options.

Throughout: clear fallback link to manual data-source configuration.

With this design, contractors experience a truly frictionless, informative AI sourcing step—seeing real-time feedback without being exposed to configuration complexity.