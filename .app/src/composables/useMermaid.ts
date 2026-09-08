import { nextTick, onMounted, watch, type Ref } from "vue";
import type { Mermaid } from "mermaid";
import { useTheme } from "@/stores/theme";

let mermaidPromise: Promise<Mermaid> | null = null;

// Mermaid is a heavy bundle and most documents have no diagrams, so it is
// loaded on first use and shared by every renderer instance.
function loadMermaid(): Promise<Mermaid> {
    if (!mermaidPromise) {
        mermaidPromise = import("mermaid").then((m) => m.default);
    }
    return mermaidPromise;
}

const SELECTOR = "pre.mermaid";

/**
 * Turns every `<pre class="mermaid" data-src="...">` inside `root` into an SVG.
 * `html` is watched so freshly rendered markdown gets processed; the theme is
 * watched because mermaid bakes colors into the SVG and must redraw on toggle.
 */
export function useMermaid(root: Ref<HTMLElement | null>, html: Ref<unknown>) {
    const theme = useTheme();

    // Mermaid replaces the node's innerHTML with SVG and marks it processed;
    // to redraw we restore the original source kept in data-src.
    function resetProcessed(host: HTMLElement) {
        for (const node of host.querySelectorAll<HTMLElement>(
            `${SELECTOR}[data-processed]`,
        )) {
            const src = node.dataset.src;
            if (src === undefined) continue;
            // textContent escapes for us; mermaid decodes entities when it reads innerHTML.
            node.textContent = src;
            node.removeAttribute("data-processed");
        }
    }

    async function render(redraw: boolean) {
        const host = root.value;
        if (!host) return;
        if (redraw) resetProcessed(host);
        const nodes = Array.from(
            host.querySelectorAll<HTMLElement>(
                `${SELECTOR}:not([data-processed])`,
            ),
        );
        if (!nodes.length) return;
        const mermaid = await loadMermaid();
        mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme: theme.mode === "dark" ? "dark" : "default",
            suppressErrorRendering: true,
        });
        try {
            await mermaid.run({ nodes });
        } catch (err) {
            // A broken fence keeps its raw source visible so the author can fix
            // it; swallowing silently would hide the problem entirely.
            console.warn("mermaid: diagram failed to render", err);
            for (const node of nodes) node.classList.add("mermaid-error");
        }
    }

    // The root ref is empty until mount, so the first pass runs from onMounted
    // rather than an immediate watcher.
    onMounted(() => render(false));
    watch(html, () => nextTick(() => render(false)), { flush: "post" });
    watch(
        () => theme.mode,
        () => nextTick(() => render(true)),
    );
}
