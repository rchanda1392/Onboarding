# Execution Plan: Switch GitHub Pages Chat to Google Gemini

**Created**: 2026-03-01
**Last Updated**: 2026-03-01
**Status**: Not Started

## Overview

Replace Azure OpenAI with Google Gemini 2.0 Flash for the GitHub Pages chat sidebar. Azure SWA deployment stays on Azure OpenAI. Only `public/chat-loader.js` changes — no new dependencies, no workflow changes.

## Architecture Reference

See `ARCHITECTURE.md` → Decision Log → "2026-03-01: GitHub Pages Chat — Switch from Azure OpenAI to Google Gemini"

---

## Phases

### Phase 1: Add Gemini Streaming Function
**Status**: ⬜ Not Started
**Prerequisites**: None
**Estimated Scope**: Small

#### Tasks
- [ ] **Task 1.1**: Add `streamChatGemini()` function
  - **Files**: `public/chat-loader.js`
  - **Details**: New function that calls the Gemini `streamGenerateContent` API with SSE streaming. Request format:
    ```json
    {
      "system_instruction": {"parts": [{"text": "system prompt + content"}]},
      "contents": [{"role": "user"|"model", "parts": [{"text": "..."}]}],
      "generationConfig": {"temperature": 0.7, "maxOutputTokens": 2048}
    }
    ```
    Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key={API_KEY}`
    SSE parse: extract `candidates[0].content.parts[0].text` from each `data:` line.
  - **Success Criteria**: Function exists and handles streaming + error cases

- [ ] **Task 1.2**: Update `sendMessage()` to route between backends
  - **Files**: `public/chat-loader.js`
  - **Details**: If `embeddedConfig` is set (Azure SWA), use existing `streamChat()`. Otherwise (GitHub Pages / localStorage), use new `streamChatGemini()`. The config object for Gemini only needs `apiKey`.
  - **Success Criteria**: Correct function is called based on config source

#### Checkpoint
- [ ] Gemini streaming function implemented
- [ ] Azure SWA path still uses existing `streamChat()`
- [ ] GitHub Pages path uses `streamChatGemini()`

---

### Phase 2: Update Setup Form UI
**Status**: ⬜ Not Started
**Prerequisites**: Phase 1
**Estimated Scope**: Small

#### Tasks
- [ ] **Task 2.1**: Simplify setup form — API key only
  - **Files**: `public/chat-loader.js`
  - **Details**: Remove the "Endpoint URI" input field from the setup HTML. Keep only the API Key field. Update heading to "Connect to Google Gemini", update description text, update placeholder to "Your Google AI Studio API key".
  - **Success Criteria**: Setup form shows one field (API key), no endpoint URI field

- [ ] **Task 2.2**: Update `bindEvents()` for single-field config
  - **Files**: `public/chat-loader.js`
  - **Details**: The save handler should store `{ apiKey }` only (no `endpointUri`). Update the validation to only check `apiKey`. Change `CONFIG_STORAGE` from `aoai-config` to `gemini-config`.
  - **Success Criteria**: Config saves/loads correctly with just `apiKey`

- [ ] **Task 2.3**: Update branding text
  - **Files**: `public/chat-loader.js`
  - **Details**:
    - File header comment: "Calls Google Gemini" instead of "Calls Azure OpenAI GPT-4o"
    - Footer: "Powered by Google Gemini" instead of "Powered by Azure OpenAI GPT-5.2"
    - Error message: "Gemini API error" instead of "Azure OpenAI error"
    - Remove "API_VERSION no longer needed" comment (not relevant)
  - **Success Criteria**: All user-visible text references Gemini, not Azure OpenAI

#### Checkpoint
- [ ] Setup form has single API key field
- [ ] Footer says "Powered by Google Gemini"
- [ ] All Azure OpenAI references removed from GitHub Pages path
- [ ] Azure SWA embedded config path still works (untouched)

---

### Phase 3: Update CSS for Removed Input
**Status**: ⬜ Not Started
**Prerequisites**: Phase 2
**Estimated Scope**: Small

#### Tasks
- [ ] **Task 3.1**: Clean up CSS selectors
  - **Files**: `public/chat-loader.js`
  - **Details**: The `#chat-endpoint-uri` CSS selectors can be removed since that input no longer exists. Update the CSS selectors that reference it (the shared styles with `#chat-key-input`).
  - **Success Criteria**: No orphaned CSS selectors, key input still styled correctly

#### Checkpoint
- [ ] No dead CSS for removed elements
- [ ] Setup form looks clean with single input

---

### Phase 4: Verify Both Deployments
**Status**: ⬜ Not Started
**Prerequisites**: Phase 3
**Estimated Scope**: Small

#### Tasks
- [ ] **Task 4.1**: Test GitHub Pages path with Gemini API key
  - **Details**: Open the site on GitHub Pages, enter a Google AI Studio API key, send a question, verify streaming response renders correctly with markdown.
  - **Success Criteria**: Chat works end-to-end with Gemini

- [ ] **Task 4.2**: Verify Azure SWA path is unchanged
  - **Details**: Confirm the embedded config codepath (`loadEmbeddedConfig` → `streamChat`) is untouched. The Azure SWA deployment should still call Azure OpenAI.
  - **Success Criteria**: No changes to embedded config logic or Azure OpenAI streaming function

#### Checkpoint
- [ ] GitHub Pages chat works with Gemini
- [ ] Azure SWA chat unaffected
- [ ] All done

---

## Risk & Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Gemini SSE format differs from expected | Low | Med | Test with real API key; Gemini docs are clear on format |
| CORS issues calling Gemini from browser | Low | Low | Gemini API allows browser calls with API key in query string |
| Old localStorage config (`aoai-config`) lingers | Low | Low | New key (`gemini-config`) means clean start; old key ignored |

## Open Questions

None — approach is well-defined.

## Notes & Decisions

- **2026-03-01**: Plan created from ARCHITECTURE.md decision log. Single-file change, 4 small phases.
