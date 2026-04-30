<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
    NButton,
    NInput,
    NIcon,
    NEmpty,
    NModal,
    NSelect,
    NTabs,
    NTabPane,
    useDialog,
    useMessage,
} from "naive-ui";
import { Plus, Save, Trash2, FilePlus } from "lucide-vue-next";
import yaml from "js-yaml";
import { api, type NoteMeta } from "@/api";
import { useContent } from "@/stores/content";
import { useUi } from "@/stores/ui";
import MdRender from "./MdRender.vue";
import MiscTree from "./MiscTree.vue";

const route = useRoute();
const content = useContent();
const ui = useUi();
const dialog = useDialog();
const message = useMessage();

const domain = computed(
    () => (route.params.domain as string | undefined) ?? "",
);
const notes = computed<NoteMeta[]>(() =>
    domain.value ? content.notesFor(domain.value) : [],
);
const misc = computed(() =>
    domain.value ? content.miscFor(domain.value) : [],
);

const selected = ref<NoteMeta | null>(null);
const title = ref("");
const body = ref("");
const dirty = ref(false);
const activeTab = ref<"editor" | "preview">("editor");
const savedTime = ref<string>("");
const pickerOpen = ref(false);
const textareaRef = ref<InstanceType<typeof NInput> | null>(null);

const wordCount = computed(() =>
    body.value.trim()
        ? body.value.trim().split(/\s+/).filter(Boolean).length
        : 0,
);

const noteOptions = computed(() =>
    notes.value.map((n) => ({
        label: String(n.frontmatter.title || n.id),
        value: n.id,
    })),
);

const selectedId = computed({
    get: () => selected.value?.id ?? null,
    set: (id) => {
        if (!id) return;
        const n = notes.value.find((x) => x.id === id);
        if (n) selectNote(n);
    },
});

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

async function loadNote(n: NoteMeta) {
    try {
        const raw = await api.raw(n.path);
        const m = raw.match(FRONTMATTER_RE);
        body.value = m ? raw.slice(m[0].length) : raw;
        title.value = String(n.frontmatter.title ?? n.id);
        selected.value = n;
        ui.selectedNoteId = n.id;
        dirty.value = false;
    } catch (e) {
        message.error(`Не удалось загрузить заметку: ${(e as Error).message}`);
    }
}

function selectNote(n: NoteMeta) {
    if (dirty.value) {
        dialog.warning({
            title: "Несохранённые изменения",
            content: "Переключить заметку и потерять правки?",
            positiveText: "Да",
            negativeText: "Отмена",
            onPositiveClick: () => loadNote(n),
        });
        return;
    }
    loadNote(n);
}

watch(
    () => ui.selectedNoteId,
    (id) => {
        if (!id) return;
        const n = notes.value.find((x) => x.id === id);
        if (n && n.id !== selected.value?.id) loadNote(n);
    },
    { immediate: true },
);

watch(notes, (list) => {
    if (selected.value && !list.find((n) => n.id === selected.value!.id)) {
        selected.value = null;
        body.value = "";
        title.value = "";
        dirty.value = false;
    }
});

function openCreate() {
    const slug = window.prompt("slug (латиница, цифры, дефис):", "");
    if (!slug) return;
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
        message.error("slug: ^[a-z0-9][a-z0-9-]*$");
        return;
    }
    const ttl = window.prompt("Заголовок:", slug);
    if (!ttl) return;
    doCreate(slug, ttl);
}

async function doCreate(slug: string, ttl: string) {
    try {
        const res = await api.createNote(domain.value, slug, ttl, "");
        await content.load(true);
        const fresh = content
            .notesFor(domain.value)
            .find((n) => n.id === res.id);
        if (fresh) await loadNote(fresh);
        message.success("Заметка создана");
    } catch (e) {
        message.error(`Создание не удалось: ${(e as Error).message}`);
    }
}

function buildFile(): string {
    const existingFm = (selected.value?.frontmatter ?? {}) as Record<
        string,
        unknown
    >;
    const fm: Record<string, unknown> = {
        id: existingFm.id,
        type: "note",
        title: title.value,
        tags: Array.isArray(existingFm.tags) ? existingFm.tags : [],
        updated: new Date().toISOString().slice(0, 10),
    };
    for (const [k, v] of Object.entries(existingFm)) {
        if (!(k in fm)) fm[k] = v;
    }
    const yml = yaml.dump(fm, { lineWidth: 120 }).trimEnd();
    return `---\n${yml}\n---\n\n${body.value}`;
}

async function save() {
    if (!selected.value) return;
    try {
        await api.saveRaw(selected.value.path, buildFile());
        await content.load(true);
        const refreshed = content
            .notesFor(domain.value)
            .find((n) => n.id === selected.value!.id);
        if (refreshed) selected.value = refreshed;
        dirty.value = false;
        savedTime.value = new Date().toLocaleTimeString("ru", {
            hour: "2-digit",
            minute: "2-digit",
        });
        message.success("Сохранено");
    } catch (e) {
        message.error(`Сохранение не удалось: ${(e as Error).message}`);
    }
}

function confirmDelete() {
    dialog.warning({
        title: "Удалить заметку",
        content: `Удалить «${selected.value?.frontmatter.title || selected.value?.id}»?`,
        positiveText: "Удалить",
        negativeText: "Отмена",
        onPositiveClick: remove,
    });
}

async function remove() {
    if (!selected.value) return;
    try {
        await api.deleteNote(selected.value.id);
        await content.load(true);
        selected.value = null;
        ui.selectedNoteId = null;
        body.value = "";
        title.value = "";
        dirty.value = false;
        message.success("Удалено");
    } catch (e) {
        message.error(`Удаление не удалось: ${(e as Error).message}`);
    }
}

function onBodyInput(v: string) {
    body.value = v;
    dirty.value = true;
}
function onTitleInput(v: string) {
    title.value = v;
    dirty.value = true;
}

function miscRelFromNote(miscPath: string): string {
    const parts = miscPath.split("/");
    const idx = parts.indexOf("misc");
    if (idx < 0) return miscPath;
    return `../${parts.slice(idx).join("/")}`;
}

function isImage(path: string): boolean {
    return /\.(png|jpg|jpeg|webp|gif|svg|bmp)$/i.test(path);
}

async function onPickMisc(path: string) {
    pickerOpen.value = false;
    const rel = miscRelFromNote(path);
    const name = path.split("/").pop() ?? "file";
    const snippet = `${isImage(path) ? "!" : ""}[${name}](${rel})`;
    const el = (textareaRef.value?.$el as HTMLElement | null)?.querySelector(
        "textarea",
    ) as HTMLTextAreaElement | null;
    if (el) {
        const start = el.selectionStart ?? body.value.length;
        const end = el.selectionEnd ?? start;
        body.value =
            body.value.slice(0, start) + snippet + body.value.slice(end);
        dirty.value = true;
        await nextTick();
        el.focus();
        const pos = start + snippet.length;
        el.setSelectionRange(pos, pos);
    } else {
        body.value += snippet;
        dirty.value = true;
    }
}

const previewDocPath = computed(() => selected.value?.path ?? "");
</script>

<template>
    <div class="notes-panel">
        <div v-if="!domain" style="padding: 12px">
            <NEmpty description="Выберите домен — заметки привязаны к домену" />
        </div>
        <template v-else>
            <!-- Top row: note selector + new + delete -->
            <div class="top-row">
                <NSelect
                    v-model:value="selectedId"
                    :options="noteOptions"
                    placeholder="Выбрать заметку..."
                    size="small"
                    class="note-select"
                    :disabled="!notes.length"
                />
                <NButton size="small" secondary @click="openCreate">
                    <template #icon
                        ><NIcon><Plus :size="14" /></NIcon
                    ></template>
                    Новая
                </NButton>
                <NButton
                    v-if="selected"
                    size="small"
                    quaternary
                    circle
                    type="error"
                    title="Удалить"
                    @click="confirmDelete"
                >
                    <template #icon
                        ><NIcon><Trash2 :size="14" /></NIcon
                    ></template>
                </NButton>
            </div>

            <!-- Title input (only when a note is selected) -->
            <NInput
                v-if="selected"
                :value="title"
                placeholder="Заголовок"
                size="small"
                class="title-input"
                @update:value="onTitleInput"
            />

            <!-- Editor / Preview tabs -->
            <NTabs
                v-if="selected"
                v-model:value="activeTab"
                size="small"
                type="line"
                class="note-tabs"
            >
                <NTabPane name="editor" tab="Редактор" class="note-panel">
                    <!-- Insert file toolbar -->
                    <div class="editor-toolbar">
                        <NButton
                            size="small"
                            quaternary
                            circle
                            title="Вставить файл"
                            :disabled="!misc.length"
                            @click="pickerOpen = true"
                        >
                            <template #icon
                                ><NIcon><FilePlus :size="14" /></NIcon
                            ></template>
                        </NButton>
                    </div>
                    <NInput
                        ref="textareaRef"
                        :value="body"
                        type="textarea"
                        placeholder="Текст заметки (markdown)…"
                        :autosize="{ minRows: 10, maxRows: 24 }"
                        @update:value="onBodyInput"
                        class="note-content"
                    />
                </NTabPane>
                <NTabPane name="preview" tab="Просмотр">
                    <div class="preview">
                        <MdRender :body="body" :doc-path="previewDocPath" />
                    </div>
                </NTabPane>
            </NTabs>

            <NEmpty
                v-else-if="!notes.length"
                description="Заметок пока нет"
                style="margin: 16px 0"
            />

            <!-- Bottom status bar -->
            <div v-if="selected" class="status-bar">
                <div class="status-left">
                    <NButton
                        v-if="dirty"
                        size="small"
                        quaternary
                        circle
                        type="primary"
                        title="Сохранить"
                        @click="save"
                    >
                        <template #icon
                            ><NIcon><Save :size="13" /></NIcon
                        ></template>
                    </NButton>
                    <span class="status-save">{{
                        dirty
                            ? "Не сохранено"
                            : savedTime
                              ? `Сохранено ${savedTime}`
                              : ""
                    }}</span>
                </div>
                <span class="status-words">{{ wordCount }} слов</span>
            </div>
        </template>

        <NModal
            v-model:show="pickerOpen"
            preset="card"
            title="Вставить ссылку на файл"
            style="max-width: 560px"
        >
            <MiscTree
                :misc="misc"
                :domain="domain"
                mode="picker"
                @pick="onPickMisc"
            />
        </NModal>
    </div>
</template>

<style scoped>
.notes-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 8px;
}
.note-panel {
    height: 100%;
}
.note-content {
    height: 95%;
}
.top-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}
.note-select {
    flex: 1;
    min-width: 0;
}
.title-input {
    flex-shrink: 0;
}
.note-tabs {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
.editor-toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 6px;
}
.preview {
    border: 1px solid var(--app-border);
    border-radius: 6px;
    padding: 12px 14px;
    max-height: calc(100vh - 320px);
    overflow: auto;
    background: var(--app-surface);
}
.status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;
    height: 49px;
    margin: 0 -14px;
    padding-left: 16px;
    padding-right: 16px;
    border-top: 1px solid var(--app-border);
    flex-shrink: 0;
}
.status-left {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
}
.status-save {
    font-size: 11px;
    opacity: 0.55;
}
.status-words {
    font-size: 11px;
    opacity: 0.55;
}
</style>
