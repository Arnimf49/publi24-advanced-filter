import { diffLines } from 'diff';
import type { ActionableElement } from '../types/browser.js';

/**
 * A snapshot of page state at a point in time.
 * Used to compute diffs between page updates.
 */
export interface PageSnapshot {
  url: string;
  title: string;
  structuredText: string;
  structuredTextWithIds: string;
  actionableElements: ActionableElement[];
}

/**
 * Represents a line-based diff for a text field in a page snapshot.
 */
export interface TextFieldDiff {
  field: 'structuredText';
  addedLines: string[];
  removedLines: string[];
}

/**
 * Represents changes to actionable elements on a page.
 */
export interface ActionableElementsChange {
  added: ActionableElement[];
  removed: ActionableElement[];
  changed: Array<{
    id: string;
    old: ActionableElement;
    new: ActionableElement;
  }>;
}

/**
 * Describes the differences between two page snapshots.
 */
export interface PageDiff {
  urlChanged: boolean;
  titleChanged: boolean;
  textFields: TextFieldDiff[];
  actionableElements: ActionableElementsChange;
}

/**
 * Manages context for persistent sub-AI sessions, tracking which mode instructions
 * have been injected and computing diffs between page snapshots.
 *
 * This class handles:
 * - Mode injection tracking: ensures mode instructions are only sent once per session
 * - Page diff computation: efficiently reports only what changed between snapshots
 *
 * **Mode tracking:** Sub-AI sessions can operate in different "modes" (e.g., 'detect_phone',
 * 'analyze_structure'). Each mode requires specific instructions to be injected into
 * the conversation. This class tracks which modes have already been injected to avoid
 * redundant instructions.
 *
 * **Page diff logic:**
 * - Text fields (structuredText): Line-based diff — report only added/removed lines.
 *   with an "updated" note. If unchanged → omit from diff.
 * - Actionable elements: Content-based diff using stable element IDs. Report only
 *   elements that were added, removed, or had their content change.
 *
 * **Usage pattern:**
 * ```ts
 * const context = new SubSessionContext();
 *
 * // First call: all modes are new
 * const newModes = context.getNewModes(['detect_phone', 'analyze_structure']);
 * // Returns: ['detect_phone', 'analyze_structure']
 *
 * // Mark them as injected
 * newModes.forEach(m => context.markModeInjected(m));
 *
 * // Subsequent call: only truly new modes returned
 * const moreNewModes = context.getNewModes(['detect_phone', 'find_links']);
 * // Returns: ['find_links'] (detect_phone already injected)
 *
 * // Track page changes
 * context.updateSnapshot(firstPageSnapshot);
 * // ... page changes ...
 * const diff = context.computeDiff(secondPageSnapshot);
 * // Returns only the changes
 * ```
 */
export class SubSessionContext {
  private injectedModes: Set<string>;
  private lastPageSnapshot: PageSnapshot | null;

  constructor() {
    this.injectedModes = new Set();
    this.lastPageSnapshot = null;
  }

  /**
   * Checks if a specific mode has been injected into the session.
   *
   * @param mode - The mode identifier to check
   * @returns True if the mode has been injected, false otherwise
   */
  hasMode(mode: string): boolean {
    return this.injectedModes.has(mode);
  }

  /**
   * Marks a mode as having been injected into the session.
   * Call this after successfully injecting mode instructions into the conversation.
   *
   * @param mode - The mode identifier to mark as injected
   */
  markModeInjected(mode: string): void {
    this.injectedModes.add(mode);
  }

  /**
   * Filters a list of requested modes to return only those that haven't been
   * injected yet.
   *
   * This is used to determine which mode instructions need to be sent to the LLM.
   * Only modes that are new to this session will be returned.
   *
   * @param requestedModes - Array of mode identifiers being requested
   * @returns Array of mode identifiers that are new to this session
   */
  getNewModes(requestedModes: string[]): string[] {
    return requestedModes.filter((mode) => !this.injectedModes.has(mode));
  }

  /**
   * Computes the differences between the last stored snapshot and a new snapshot.
   *
   * Returns null if there is no previous snapshot (first call).
   *
   * **Diff strategy:**
   * - URL/title: Simple equality check, flag if different
   * - Text fields: Include full new value only if changed
   * - Actionable elements: Content-based comparison using element IDs
   *
   * @param current - The new page snapshot to compare against the stored snapshot
   * @returns PageDiff describing the changes, or null if no previous snapshot exists
   */
  computeDiff(current: PageSnapshot): PageDiff | null {
    if (this.lastPageSnapshot === null) {
      return null;
    }

    const previous = this.lastPageSnapshot;

    const urlChanged = previous.url !== current.url;
    const titleChanged = previous.title !== current.title;

    const textFields: TextFieldDiff[] = [];

    for (const field of ['structuredText'] as const) {
      if (previous[field] !== current[field]) {
        textFields.push({
          field,
          ...this.computeLineDiff(previous[field], current[field]),
        });
      }
    }

    const actionableElements = this.computeElementsDiff(
      previous.actionableElements,
      current.actionableElements,
    );

    return {
      urlChanged,
      titleChanged,
      textFields,
      actionableElements,
    };
  }

  /**
   * Updates the stored snapshot to the provided snapshot.
   * Call this after successfully processing a page update.
   *
   * @param snapshot - The new snapshot to store
   */
  updateSnapshot(snapshot: PageSnapshot): void {
    this.lastPageSnapshot = snapshot;
  }

  /**
   * Computes a content-based diff of actionable elements.
   *
   * Elements are matched by their stable ID. An element is considered:
   * - Added: present in current but not in previous
   * - Removed: present in previous but not in current
   * - Changed: present in both but with different content
   *
   * @param previous - Previous array of actionable elements
   * @param current - Current array of actionable elements
   * @returns Object describing added, removed, and changed elements
   */
  private computeLineDiff(previous: string, current: string): { addedLines: string[]; removedLines: string[] } {
    const hunks = diffLines(previous, current);
    const addedLines: string[] = [];
    const removedLines: string[] = [];

    for (const hunk of hunks) {
      const lines = (hunk.value ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
      if (hunk.added) {
        addedLines.push(...lines);
      } else if (hunk.removed) {
        removedLines.push(...lines);
      }
    }

    return { addedLines, removedLines };
  }

  private computeElementsDiff(
    previous: ActionableElement[],
    current: ActionableElement[],
  ): ActionableElementsChange {
    const previousMap = new Map(previous.map((el) => [el.id, el]));
    const currentMap = new Map(current.map((el) => [el.id, el]));

    const added: ActionableElement[] = [];
    const removed: ActionableElement[] = [];
    const changed: Array<{ id: string; old: ActionableElement; new: ActionableElement }> = [];

    // Find added and changed elements
    for (const [id, currentEl] of currentMap.entries()) {
      const previousEl = previousMap.get(id);

      if (previousEl === undefined) {
        // Element is new
        added.push(currentEl);
      } else if (!this.elementsEqual(previousEl, currentEl)) {
        // Element content changed
        changed.push({
          id,
          old: previousEl,
          new: currentEl,
        });
      }
    }

    // Find removed elements
    for (const [id, previousEl] of previousMap.entries()) {
      if (!currentMap.has(id)) {
        removed.push(previousEl);
      }
    }

    return {
      added,
      removed,
      changed,
    };
  }

  /**
   * Compares two ActionableElement objects for content equality.
   *
   * Two elements are considered equal if all their relevant fields match.
   * The ID is not checked (it's already been used for matching).
   *
   * @param a - First element
   * @param b - Second element
   * @returns True if elements have identical content
   */
  private elementsEqual(a: ActionableElement, b: ActionableElement): boolean {
    return (
      a.role === b.role &&
      a.tagName === b.tagName &&
      a.name === b.name &&
      a.contextHint === b.contextHint &&
      a.href === b.href &&
      a.isLikelyEntryGate === b.isLikelyEntryGate &&
      this.arraysEqual(a.actionabilityReasons ?? [], b.actionabilityReasons ?? [])
    );
  }

  /**
   * Compares two arrays for equality.
   *
   * @param a - First array
   * @param b - Second array
   * @returns True if arrays have the same length and all elements are equal
   */
  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }
}

export const subSessionContext = {
  SubSessionContext,
};
