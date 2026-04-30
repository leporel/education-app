<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NButton, NIcon } from "naive-ui";
import {
    ChevronLeft,
    ChevronRight,
    StickyNote,
    Sun,
    Moon,
    Settings,
} from "lucide-vue-next";
import { useTheme } from "@/stores/theme";
import { useUi } from "@/stores/ui";
import SearchBar from "@/components/SearchBar.vue";
import RouteBreadcrumb from "./RouteBreadcrumb.vue";

const route = useRoute();
const router = useRouter();
const theme = useTheme();
const ui = useUi();

const currentDomain = computed(
    () => (route.params.domain as string | undefined) ?? "",
);

function goBack() {
    router.back();
}

function goForward() {
    router.forward();
}

const canGoBack = computed(() => {
    const pos =
        (window.history.state as { position?: number } | null)?.position ?? 0;
    return pos > 0;
});
</script>

<template>
    <header class="top-nav">
        <div class="nav-left">
            <NButton
                quaternary
                circle
                size="small"
                :disabled="!canGoBack"
                title="Назад"
                @click="goBack"
            >
                <template #icon
                    ><NIcon><ChevronLeft :size="16" /></NIcon
                ></template>
            </NButton>
            <NButton
                quaternary
                circle
                size="small"
                title="Вперёд"
                @click="goForward"
            >
                <template #icon
                    ><NIcon><ChevronRight :size="16" /></NIcon
                ></template>
            </NButton>
        </div>

        <div class="nav-center">
            <RouteBreadcrumb />
        </div>

        <div class="nav-right">
            <SearchBar />

            <NButton
                v-if="currentDomain"
                quaternary
                circle
                size="small"
                :title="ui.notesOpen ? 'Скрыть заметки' : 'Показать заметки'"
                @click="ui.toggleNotes"
            >
                <template #icon
                    ><NIcon><StickyNote :size="16" /></NIcon
                ></template>
            </NButton>

            <NButton
                quaternary
                circle
                size="small"
                :title="theme.mode === 'dark' ? 'Светлая тема' : 'Тёмная тема'"
                @click="theme.toggle"
            >
                <template #icon>
                    <NIcon>
                        <Sun v-if="theme.mode === 'dark'" :size="16" />
                        <Moon v-else :size="16" />
                    </NIcon>
                </template>
            </NButton>
        </div>
    </header>
</template>

<style scoped>
.top-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    border-bottom: 1px solid var(--app-border);
    background: var(--app-sidebar);
    height: 100%;
    overflow: hidden;
}
.nav-left {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
}
.nav-center {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
.nav-right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}
</style>
