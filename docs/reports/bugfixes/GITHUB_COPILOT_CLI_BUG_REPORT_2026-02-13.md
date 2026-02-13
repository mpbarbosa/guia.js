# GitHub Copilot CLI Bug Report: Ctrl+Enter Hotkey Not Working

## Bug Description

**Issue**: The Ctrl+Enter hotkey does not enqueue prompts in the GitHub Copilot CLI TUI as expected. Instead, it inserts a carriage return (newline).

**Expected Behavior**: Pressing Ctrl+Enter should enqueue the current prompt for processing.

**Actual Behavior**: Pressing Ctrl+Enter inserts a newline character instead of enqueueing the prompt.

**Regression**: This is a regression from the previous version where Ctrl+D was used to enqueue prompts. Documentation indicates Ctrl+Enter should now be used for this purpose.

---

## Environment Information

### System Details
- **Operating System**: Ubuntu 25.10 (Questing Quokka)
- **Kernel**: Linux 6.17.0-14-generic
- **Architecture**: x86_64 (64-bit)
- **Distribution**: Ubuntu (PREEMPT_DYNAMIC kernel)

### Shell Environment
- **Shell**: Zsh (`/usr/bin/zsh`)
- **Framework**: Oh My Bash (update lock present)
- **TERM**: `xterm-color`
- **Bash Version**: GNU bash, version 5.3.0(1)-release

### GitHub CLI
- **gh Version**: 2.46.0 (2025-01-13)
- **Package**: Ubuntu 2.46.0-3
- **GitHub Copilot CLI**: Integrated (version via extension)

### Terminal Configuration
- **Terminal Type**: `xterm-color`
- **COLORTERM**: Not set (or inherited)
- **Locale**: System default (UTF-8 assumed)

### Session Context
- **Working Directory**: `/home/mpb/Documents/GitHub/guia_turistico`
- **IDE Integration**: Visual Studio Code - Insiders
- **Workspace**: Active Git repository

---

## Reproduction Steps

1. Launch GitHub Copilot CLI in TUI mode:
   ```bash
   gh copilot
   ```

2. Type a prompt in the input field

3. Press **Ctrl+Enter** hotkey

**Expected Result**: Prompt is enqueued and processed  
**Actual Result**: A newline is inserted in the input field, prompt is not enqueued

---

## Additional Context

### Hotkey History
- **Previous Version**: Ctrl+D was used to enqueue prompts
- **Current Version**: Documentation indicates Ctrl+Enter should enqueue prompts
- **Issue**: Ctrl+Enter is not being intercepted by the TUI; instead, terminal emulator processes it as a newline

### Terminal Key Binding Conflict
The issue may be caused by:
1. **Terminal Emulator Override**: The terminal may be intercepting Ctrl+Enter before it reaches the TUI
2. **TTY Settings**: Raw mode may not be properly set for Ctrl+Enter
3. **TUI Input Handling**: The TUI may not be correctly handling the Ctrl+Enter key combination

### Workaround Attempts
- **Alternative hotkeys**: User needs to determine if Ctrl+D still works or if another hotkey can be used
- **Enter key**: Standard Enter might work for single-line prompts

---

## Expected Fix

The GitHub Copilot CLI TUI should:
1. Correctly intercept the Ctrl+Enter key combination
2. Prevent the terminal emulator from processing it as a newline
3. Trigger the prompt enqueueing action when Ctrl+Enter is pressed

### Technical Recommendations

**For TUI Input Handling**:
- Ensure raw mode is set correctly: `termios` ICANON disabled
- Check key code mapping: Ctrl+Enter typically produces `\r` (CR) or may need explicit handling
- Consider using alternative key combinations that are less likely to be intercepted (e.g., Ctrl+Space, Ctrl+])

**For Documentation**:
- Clarify if Ctrl+Enter is the correct hotkey for all terminal emulators
- Provide alternative hotkeys for terminals where Ctrl+Enter is intercepted
- Document any terminal-specific configuration needed

---

## System Logs

### Keyboard Input Test
Terminal key codes for relevant keys:
- **Enter**: `\n` (LF)
- **Ctrl+Enter**: `\r` (CR) - **Processed by terminal, not TUI**
- **Ctrl+D**: EOF signal (may still work?)

### TTY Configuration
```
Current TTY settings may affect key handling:
- ICANON: Canonical mode (affects Ctrl keys)
- ICRNL: CR to NL translation
- INLCR: NL to CR translation
```

---

## Impact

**Severity**: **High**  
**User Impact**: Critical workflow disruption - users cannot enqueue prompts using the documented hotkey

**Affected Users**:
- All users on Linux with `xterm-color` terminal
- Potentially all Ubuntu 25.10+ users
- Users with similar terminal emulator configurations

**Workaround Available**: Unknown - requires testing alternative hotkeys (Ctrl+D, Shift+Enter, etc.)

---

## Suggested Priority

**Priority**: **P1 - High**

**Justification**:
1. Documented hotkey does not work as advertised
2. Core functionality (prompt enqueueing) is broken for affected users
3. No clear workaround documented
4. Regression from previous version (breaking change)

---

## Additional Information Needed

To further diagnose, please provide:
1. **Expected key code**: What key code should Ctrl+Enter produce in the TUI?
2. **Alternative hotkeys**: Are there documented alternatives for Ctrl+Enter?
3. **Terminal compatibility**: Which terminals have been tested?
4. **Debug mode**: Is there a debug mode to see raw key input?

---

## Reporter Information

- **Username**: mpb
- **System**: tatooine (Ubuntu 25.10)
- **Report Date**: 2026-02-13
- **Session**: GitHub Copilot CLI TUI active session

---

## Related Issues

- [ ] Check if this is specific to Ubuntu 25.10
- [ ] Verify behavior on other Linux distributions
- [ ] Test with different terminal emulators (gnome-terminal, konsole, alacritty, etc.)
- [ ] Document correct TTY settings for Ctrl+Enter to work

---

**End of Bug Report**

---

## How to Submit This Report

### Option 1: GitHub Issues (Recommended)
```bash
gh issue create \
  --repo github/gh-copilot \
  --title "Ctrl+Enter hotkey not working in TUI (inserts newline instead)" \
  --body-file bug_report.md \
  --label "bug,tui,hotkey"
```

### Option 2: GitHub Copilot Feedback
1. Open GitHub Copilot CLI
2. Use the feedback command (if available)
3. Paste the bug report content

### Option 3: GitHub Discussions
Post in GitHub Copilot Discussions under "Bug Reports" category with the full report.
