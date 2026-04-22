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



4\. Task 5.3: The Command Console (Usage \& Logs)



API Visibility \& Monitoring



A centralized dashboard within Settings to monitor the health and cost of your integrations:



Usage Counter: Track "Total Minutes Transcribed" (AssemblyAI) and "Total Analysis Requests" (Gemini).



Resource Links: \* Google AI Studio (Gemini) Dashboard



AssemblyAI Billing



Firebase Console (Database/Auth)



Taddy API Dashboard



Tier Info: Reference table showing current rate limits (e.g., "Gemini Flash: 15 RPM").



The Error Log (The "Black Box")



Location: A "Logs" tab in Settings.



Content: Captures failures with timestamps, module names (Taddy, Assembly, Gemini), and raw error messages.



Retention: Logs are auto-deleted after 7 days to keep Firestore lean.



5\. Task 5.4: Security \& Multi-User Implementation



Whitelist: Managed via VITE\_AUTHORIZED\_EMAILS environment variable.



Private Sandboxes: Every user has their own private library, prompts, and logs.



Logic: Use the Firebase uid in the Firestore path to ensure data isolation between authorized users.

