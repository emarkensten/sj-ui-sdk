/*
 * Optional agent entry: lets an AI agent read and use sj-ui components through
 * UI SDK's agent bridge (snapshot, query, act), and hands the same tools to the
 * browser's own agent through WebMCP where the browser has it.
 *
 * Every interactive sj-ui component is built on UI SDK parts, so it shows up here
 * with its label, value and actions. DepartureCard shows up as a button named by
 * its departure time, so "press 08:10" selects it.
 *
 * Mark a step that must be made by a person, like paying or cancelling a booking,
 * with `data-agent-confirm="Betala 495 kr"` on the element or an element around it.
 */
import { createAgent, registerTools, type AgentAction } from "@ui-sdk/react/agent";

export type { AgentAction, AgentChange, AgentComponent, AgentStep } from "@ui-sdk/react/agent";
export { agentTools } from "@ui-sdk/react/agent";

export type SjAgent = ReturnType<typeof createAgent>;

export interface SjAgentOptions {
  /**
   * Asks the person to approve a step the page marked with `data-agent-confirm`.
   * Without it, such steps fail and are left to the person. Other steps run.
   */
  confirm?: (step: AgentAction, signal: AbortSignal) => boolean | Promise<boolean>;
  /** Extra rule for every step. Return false to refuse it. */
  allow?: (step: AgentAction) => boolean | Promise<boolean>;
}

/**
 * Creates the agent bridge with SJ's defaults: steps the page marked for a person need
 * `confirm`, everything else runs unless `allow` refuses it. Call it before the first render,
 * since it hears components as they mount.
 */
export function createSjAgent({ confirm, allow }: SjAgentOptions = {}): SjAgent {
  return createAgent({
    allow: async (step, { signal }) => {
      if (allow && !(await allow(step))) return false;
      if (step.confirm) return confirm ? confirm(step, signal) : false;
      return true;
    },
  });
}

/**
 * Hands the agent's tools to the browser's own agent (WebMCP). Does nothing in browsers
 * without it. The browser's agent is not one SJ controls, so every step that changes
 * something must pass `confirm`, not only the marked ones. Returns an unregister function.
 */
export function registerSjBrowserTools(
  agent: SjAgent,
  confirm: (step: AgentAction, signal: AbortSignal) => boolean | Promise<boolean>,
): () => void {
  if (typeof document === "undefined") return () => {};
  return registerTools(agent, { allow: (step, { signal }) => confirm(step, signal) });
}
