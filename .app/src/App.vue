<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider } from "naive-ui";
import { RouterView, useRoute } from "vue-router";
import { onMounted, watch } from "vue";
import { useRecent } from "@/composables/useRecent";
import { useProgress } from "@/stores/progress";
import { useTheme } from "@/stores/theme";
import { useContent } from "@/stores/content";
import { useUi } from "@/stores/ui";
import { useSrs } from "@/stores/srs";
import TopNav from "@/components/layout/TopNav.vue";
import LeftSidebar from "@/components/layout/LeftSidebar.vue";
import FileTreePanel from "@/components/tree/FileTreePanel.vue";
import NotesSidebar from "@/components/NotesSidebar.vue";

const route = useRoute();
const progress = useProgress();
const theme = useTheme();
const content = useContent();
const ui = useUi();
const srs = useSrs();
const recent = useRecent();

watch(
    () => route.params.docId,
    (id) => {
        if (id) recent.push(decodeURIComponent(id as string));
    },
);

watch(
    () => route.query.note,
    (v) => {
        const id = Array.isArray(v) ? v[0] : v;
        if (id) ui.openNote(String(id));
    },
    { immediate: true },
);

onMounted(async () => {
    await content.load();
    await progress.load();
    await srs.refresh();
});
</script>

<template>
    <NConfigProvider :theme="theme.naive" :theme-overrides="theme.overrides">
        <NMessageProvider>
            <NDialogProvider>
                <div
                    class="app-shell"
                    :class="[
                        `theme-${theme.mode}`,
                        {
                            'notes-col':
                                route.params.domain &&
                                ui.notesPinned &&
                                ui.notesOpen,
                            'left-collapsed': ui.leftCollapsed,
                        },
                    ]"
                >
                    <div class="top-nav">
                        <TopNav />
                    </div>
                    <div class="left-sidebar main-panels">
                        <LeftSidebar />
                    </div>
                    <div class="file-tree main-panels">
                        <FileTreePanel />
                    </div>
                    <main class="content-area main-panels">
                        <RouterView v-slot="{ Component, route: r }">
                            <div
                                v-if="r.name === 'lesson'"
                                class="content-lesson"
                            >
                                <component :is="Component" />
                            </div>
                            <div v-else class="content-scroll">
                                <component :is="Component" />
                            </div>
                        </RouterView>
                    </main>
                    <aside
                        v-if="
                            route.params.domain &&
                            ui.notesPinned &&
                            ui.notesOpen
                        "
                        class="notes-column main-panels"
                    >
                        <NotesSidebar :pinned="true" />
                    </aside>
                </div>
                <NotesSidebar
                    v-if="
                        route.params.domain && !(ui.notesPinned && ui.notesOpen)
                    "
                    :pinned="false"
                />
            </NDialogProvider>
        </NMessageProvider>
    </NConfigProvider>
</template>

<style>
/* App-level CSS vars — must mirror src/theme/palette.ts */
.theme-dark {
    --app-bg: #1a1e25;
    --app-sidebar: #1b2026; /* panel */
    --app-tree: #1b1f26; /* surfaceAlt */
    --app-surface: #21262d;
    --app-border: #252a32;
    --app-divider: #1f2329;
    --app-text: #dde2ea;
    --app-text-2: #abb1bb;
    --app-muted: #7a818c;
    --app-text-mute2: #5a606b;
    --app-primary: #2563b8;
    --app-primary-soft: rgba(37, 99, 184, 0.22);
    --app-success: #6dba8a;
    --app-success-soft: #23392f;
    --app-warning: #d8b462;
    --app-warning-soft: rgba(216, 180, 98, 0.18);
    --app-info: #5b9bd5;
    --app-info-soft: #1b2e4a;
    --app-error: #d48787;
    --app-hover: rgba(255, 255, 255, 0.05);
    --app-scroll-thumb: rgba(221, 226, 234, 0.22);
    --md-link: #2563b8;
    --md-link-hover: #3b79ce;
    --md-border: #414751;
}
.theme-light {
    --app-bg: #ebe9e5;
    --app-sidebar: #e3e0db; /* panel */
    --app-tree: #e8e6e2; /* surfaceAlt */
    --app-surface: #e3e0db;
    --app-border: #dbd7cf;
    --app-divider: #e0dcd4;
    --app-text: #000000;
    --app-text-2: #3d3d44;
    --app-muted: #6b6b72;
    --app-text-mute2: #8e8b84;
    --app-primary: #3d6e9c;
    --app-primary-soft: rgba(61, 110, 156, 0.14);
    --app-success: #5a8a4d;
    --app-success-soft: rgba(90, 138, 77, 0.14);
    --app-warning: #b8873a;
    --app-warning-soft: rgba(184, 135, 58, 0.14);
    --app-info: #3d6e9c;
    --app-info-soft: rgba(61, 110, 156, 0.14);
    --app-error: #b85c5c;
    --app-hover: rgba(0, 0, 0, 0.04);
    --app-scroll-thumb: rgba(42, 42, 46, 0.22);
    --md-link: #3d6e9c;
    --md-link-hover: #4d80b0;
    --md-border: #b0aba1;
}

:root {
    --app-bg: #1a1e25;
}

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
    background: var(--app-bg);
}

/* Global thin scrollbars — track invisible at rest, thumb appears when
   the pointer is over a scrollable area. */
* {
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
}
*:hover {
    scrollbar-color: var(--app-scroll-thumb) transparent;
}
*::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
*::-webkit-scrollbar-track {
    background: transparent;
}
*::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 8px;
    border: 2px solid transparent;
    background-clip: padding-box;
    transition: background 0.15s;
}
*:hover::-webkit-scrollbar-thumb {
    background: var(--app-scroll-thumb);
    background-clip: padding-box;
}
*::-webkit-scrollbar-thumb:hover {
    background: var(--app-muted);
    background-clip: padding-box;
}
*::-webkit-scrollbar-corner {
    background: transparent;
}
</style>

<style scoped>
.app-shell {
    display: grid;
    height: 100vh;
    grid-template-rows: 48px 1fr;
    grid-template-columns: 240px 240px 1fr;
    overflow: hidden;
    background: var(--app-bg);
    color: var(--app-text);
    transition: grid-template-columns 0.18s ease;
    gap: 7px;
}

.app-shell.notes-col {
    grid-template-columns: 240px 240px 1fr 420px;
}

.app-shell.left-collapsed {
    grid-template-columns: 56px 240px 1fr;
}

.app-shell.left-collapsed.notes-col {
    grid-template-columns: 56px 240px 1fr 420px;
}

.top-nav {
    grid-column: 1 / -1;
    grid-row: 1;
    min-height: 0;
    overflow: hidden;
    background: var(--app-sidebar);
    border-bottom: 1px solid var(--app-border);
}

.main-panels {
    border-radius: 10px;
    border: 1px solid var(--app-border);
    margin-bottom: 10px;
}

.left-sidebar {
    grid-column: 1;
    grid-row: 2;
    min-height: 0;
    overflow: hidden auto;
    background: var(--app-sidebar);
}

.file-tree {
    grid-column: 2;
    grid-row: 2;
    min-height: 0;
    overflow: hidden;
    background: var(--app-tree);
}

.content-area {
    grid-column: 3;
    grid-row: 2;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--app-bg);
}

.content-scroll {
    flex: 1;
    overflow: auto;
    padding: 24px 28px;
    min-height: 0;
}

.content-lesson {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.notes-column {
    grid-column: 4;
    grid-row: 2;
    min-height: 0;
    overflow: hidden;
}

/*  The issue is that Tag.color in Naive UI's override system maps to a different CSS var,
 not --n-color — that one is set inline by Naive UI and ignores our theme override.
 Since we now apply the theme class to <html>, a CSS rule with !important will reliably
 override Naive UI's inline style for custom properties.

 TODO: возможно это надо было как то по другому сделать
 */
.n-tag {
    background-color: var(--app-bg) !important;
}
</style>
