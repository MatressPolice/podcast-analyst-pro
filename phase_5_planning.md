**Phase Five Updates:**



Phase 5: The Intelligence Control Center



1\. Structural Definitions \& Routing



Archive vs. Saved (The Distinction)



Archive: An "Auto-Log" for every analysis you run. It acts as your personal chronological history.



Saved: A manual "Personal Workbench" for specific reports you choose to bookmark.



Status: Building the Archive first.



Sidebar Navigation Update



Library: Current episode queue.



Discover: Search for new content.



Archive: Personal history of generated briefs.



Settings: The hub for Prompts, Usage, and Logs.



Rationale: Keeps the UI focused on reading while centralizing management.



2\. Task 5.1: The Intelligence Archive



Private Libraries: Data is stored at /artifacts/${appId}/users/${user.uid}/analyses.



Note: Users (Mike and Joe) have completely private libraries.



Data Points per Card:



Podcast Name \& Artwork



Episode Title



Episode Release Date (Explicitly labeled "Released on...")



Analysis Date (Explicitly labeled "Analyzed on...")



Status Badge: (Success, Failed, Processing).



Concurrent Workflows: The UI allows "Background Processing." You can start an analysis, close the overlay, and browse other podcasts while the "Sage" works.



3\. Task 5.2: The Prompt Laboratory (Settings)



Storage \& Logic



Storage: Firestore collection prompts within the user's private path.



Limits: Hard limit of 3 Prompts to keep the selection clean.



Global Selection: Choose an "Active" prompt in Settings; this remains the default for all future analyses until changed.



The Interface



A list of your 3 prompts with: Name, Active Toggle, and Edit.



Editor: A clean text area for custom instructions.



4. Task 5.3: The Command Console (Resource Hub & Logs)

Objective: Provide direct access to external billing/usage and a local error-tracking system.

Settings Layout (The Architecture)

Implement a horizontal Tab Bar at the top of the Settings page: [Prompts] | [Resources] | [Logs].

This ensures each functional area has its own clean, focused view and scales for future additions.

API Command Center (Resources Tab)

Google AI Studio (Gemini):

Billing: https://aistudio.google.com/app/billing

Usage: https://aistudio.google.com/usage?project=gen-lang-client-0377055736&timeRange=last-28-days

AssemblyAI (Transcription):

Cost: https://www.assemblyai.com/dashboard/cost

Usage: https://www.assemblyai.com/dashboard/usage

Rate Limits: https://www.assemblyai.com/dashboard/rate-limits

Firebase Console:

Overview: https://console.firebase.google.com/u/0/project/podcast-analyst-pro/overview

Billing: https://console.firebase.google.com/u/0/project/podcast-analyst-pro/usage

Taddy API (Podcast & Episode Details):

Dashboard: https://taddy.org/dashboard/my-apps

Tier Reference Table (Resources Tab)

Gemini 3 Flash: 15 Requests Per Minute.

Taddy API: 500 Requests Per Month (Free Tier).

AssemblyAI: $50 Initial Credit / Rate limited by tier.

The Error Log (Logs Tab)

Location: Firestore collection users/{uid}/logs.

Data: Captures timestamps, Module name (Taddy, Assembly, Gemini), and the Raw Error Message.

Retention: UI should indicate that entries older than 7 days are subject to auto-deletion.



5\. Task 5.4: Security \& Multi-User Implementation



Whitelist: Managed via VITE\_AUTHORIZED\_EMAILS environment variable.



Private Sandboxes: Every user has their own private library, prompts, and logs.



Logic: Use the Firebase uid in the Firestore path to ensure data isolation between authorized users.

