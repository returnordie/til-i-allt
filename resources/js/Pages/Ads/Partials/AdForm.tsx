// resources/js/Components/AdForm.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import Hero from '@/Components/Hero';
import TTButton from '@/Components/UI/TTButton';

type SectionKey = 'solutorg' | 'bilatorg' | 'fasteignir';

type NavChild = { name: string; slug: string; icon?: string | null };
type NavParent = { name: string; slug: string; icon?: string | null; children?: NavChild[] };

type SharedProps = {
    nav: {
        categories: Record<SectionKey, NavParent[]>;
        heroArtUrl?: string;
    };
    regions?: Array<{ id: number; name: string }>;
    postcodes?: Array<{ id: number; code: string; name: string; region_id: number }>;
};

export type FieldDef = {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'multiselect';
    required?: boolean;
    placeholder?: string;
    help?: string;
    unit?: string;
    group?: string;
    options?: { value: string; label: string }[];
};

export type AdFormMode = 'create' | 'edit';

export type AdFormInitial = {
    section?: SectionKey;
    category_slug?: string; // parent slug
    subcategory_slug?: string; // child slug
    listing_type?: 'sell' | 'want';
    title?: string;
    price?: number | null;
    description?: string;
    location_text?: string | null;
    postcode_id?: number | null;
    attributes?: Record<string, any>;
};

export type ExistingAdImage = {
    id: number;
    public_id: string;
    url: string;
    is_main: boolean;
};

type FormData = {
    section: SectionKey | '';
    category_slug: string;
    subcategory_slug: string;
    listing_type: 'sell' | 'want';
    title: string;
    price: string;
    description: string;
    location_text: string;
    postcode_id: number | '';
    attributes: Record<string, any>;

    images: File[];
    main_image_index: number | null;

    delete_image_public_ids: string[];
    main_image_public_id: string | null;

    _method?: 'put';
};

type MainPick =
    | { kind: 'existing'; public_id: string }
    | { kind: 'new'; index: number }
    | null;

const SECTIONS: { key: SectionKey; title: string; desc: string; icon: string }[] = [
    { key: 'solutorg', title: 'Sölutorg', desc: 'Almennar smáauglýsingar.', icon: 'storefront' },
    { key: 'bilatorg', title: 'Bílatorg', desc: 'Ökutæki með ítarlegum upplýsingum.', icon: 'directions_car' },
    { key: 'fasteignir', title: 'Fasteignir', desc: 'Leiga/sala með sértækum reitum.', icon: 'home' },
];

function sectionLabel(s: SectionKey) {
    if (s === 'solutorg') return 'Sölutorg';
    if (s === 'bilatorg') return 'Bílatorg';
    return 'Fasteignir';
}

function MsIcon({ icon, className = '' }: { icon?: string | null; className?: string }) {
    const name = (icon ?? '').trim() || 'category';
    return (
        <span className={`material-symbols-rounded tt-msym ${className}`} aria-hidden="true">
            {name}
        </span>
    );
}

function formatISK(value: string) {
    if (!value) return 'Verð á samkomulagi';
    const n = Number(value);
    if (Number.isNaN(n)) return value;
    try {
        return new Intl.NumberFormat('is-IS').format(n) + ' kr.';
    } catch {
        return value + ' kr.';
    }
}

function optionLabel(options: { value: string; label: string }[] | undefined, value: any) {
    if (!options) return null;
    const found = options.find((o) => String(o.value) === String(value));
    return found ? found.label : null;
}

function fmtNumber(n: any) {
    if (n === null || n === undefined || n === '') return null;
    const num = typeof n === 'number' ? n : Number(n);
    if (Number.isNaN(num)) return String(n);
    try {
        return new Intl.NumberFormat('is-IS').format(num);
    } catch {
        return String(num);
    }
}

function hasMeaningfulValue(f: FieldDef, value: any) {
    if (f.type === 'boolean') return true;
    if (f.type === 'multiselect') return Array.isArray(value) ? value.length > 0 : false;
    return !(value === null || value === undefined || value === '');
}

function renderReviewAttrValue(f: FieldDef, value: any): React.ReactNode {
    const unit = f.unit ? ` ${f.unit}` : '';

    if (f.type === 'boolean') return value ? 'Já' : 'Nei';

    if (f.type === 'number') {
        const v = fmtNumber(value);
        return v ? `${v}${unit}` : '—';
    }

    if (f.type === 'select') {
        const lbl = optionLabel(f.options, value);
        return lbl ?? (value ?? '—');
    }

    if (f.type === 'multiselect') {
        const arr = Array.isArray(value) ? value : [];
        if (!arr.length) return '—';
        const labels = arr.map((v) => optionLabel(f.options, v) ?? String(v));
        return (
            <div className="d-flex flex-wrap gap-2">
                {labels.map((t, i) => (
                    <span key={i} className="tt-pill">
                        {t}
                    </span>
                ))}
            </div>
        );
    }

    if (value === null || value === undefined || value === '') return '—';
    return String(value);
}

function findNames(
    nav: Record<SectionKey, NavParent[]> | undefined,
    section: SectionKey | '',
    parentSlug: string,
    childSlug: string,
) {
    if (!nav || !section) return { parentName: null as string | null, childName: null as string | null };
    const parents = nav[section] ?? [];

    const p = parents.find((x) => x.slug === parentSlug) ?? null;
    const c = p?.children?.find((x) => x.slug === childSlug) ?? null;

    if (!c && childSlug) {
        const via = parents.find((pp) => (pp.children ?? []).some((cc) => cc.slug === childSlug));
        const cc = via?.children?.find((x) => x.slug === childSlug) ?? null;
        return { parentName: (via ?? p)?.name ?? null, childName: cc?.name ?? null };
    }

    return { parentName: p?.name ?? null, childName: c?.name ?? null };
}

export default function AdForm({
                                   mode,
                                   initial,
                                   submitUrl,
                                   fieldDefs = [],
                                   allowSectionChangeOnEdit = false,
                                   fieldDefsEndpoint,
                                   existingImages = [],
                               }: {
    mode: AdFormMode;
    initial?: AdFormInitial;
    submitUrl: string;
    fieldDefs?: FieldDef[];
    allowSectionChangeOnEdit?: boolean;
    fieldDefsEndpoint?: string;
    existingImages?: ExistingAdImage[];
}) {
    const { props } = usePage<SharedProps>();
    const nav = props.nav?.categories;
    const heroArtUrl = props.nav?.heroArtUrl;

    type Step = 0 | 1 | 2 | 3 | 4;
    const startStep: Step = mode === 'edit' ? 2 : 0;

    const [step, setStep] = useState<Step>(startStep);
    const [openParent, setOpenParent] = useState<string>(initial?.category_slug ?? '');

    const form = useForm<FormData>({
        section: initial?.section ?? '',
        category_slug: initial?.category_slug ?? '',
        subcategory_slug: initial?.subcategory_slug ?? '',
        listing_type: initial?.listing_type ?? 'sell',
        title: initial?.title ?? '',
        price: initial?.price ? String(initial.price) : '',
        description: initial?.description ?? '',
        location_text: initial?.location_text ?? '',
        postcode_id: initial?.postcode_id ?? '',
        attributes: initial?.attributes ?? {},

        images: [],
        main_image_index: null,

        delete_image_public_ids: [],
        main_image_public_id: null,
    });

    const { data, setData, post, processing, errors } = form;
    const err = (key: string) => (errors as any)?.[key] as string | undefined;

    const isLeafSection = data.section === 'bilatorg' || data.section === 'fasteignir';
    const isVehicleSection = data.section === 'bilatorg';

    const regions = props.regions ?? [];
    const postcodes = props.postcodes ?? [];
    const [regionId, setRegionId] = useState<string>(() => {
        if (initial?.postcode_id) {
            const match = postcodes.find((pc) => pc.id === initial.postcode_id);
            return match ? String(match.region_id) : '';
        }
        return '';
    });

    useEffect(() => {
        if (!data.postcode_id) return;
        const match = postcodes.find((pc) => pc.id === Number(data.postcode_id));
        if (match && String(match.region_id) !== regionId) {
            setRegionId(String(match.region_id));
        }
    }, [data.postcode_id, postcodes, regionId]);

    const filteredPostcodes = useMemo(() => {
        if (!regionId) return postcodes;
        return postcodes.filter((pc) => pc.region_id === Number(regionId));
    }, [postcodes, regionId]);

    const selectedPostcode = useMemo(() => {
        if (!data.postcode_id) return null;
        return postcodes.find((pc) => pc.id === Number(data.postcode_id)) ?? null;
    }, [postcodes, data.postcode_id]);

    const locationSummary = useMemo(() => {
        const parts = [];
        if (selectedPostcode) {
            parts.push(`${selectedPostcode.code}${selectedPostcode.name ? ` ${selectedPostcode.name}` : ''}`);
        }
        if (data.location_text) {
            parts.push(data.location_text);
        }
        return parts.filter(Boolean).join(' · ');
    }, [selectedPostcode, data.location_text]);

    // UI guard: Bílatorg má ekki vera "Óskast"
    useEffect(() => {
        if (data.section === 'bilatorg' && data.listing_type === 'want') {
            setData('listing_type', 'sell');
        }
    }, [data.section]);

    const currentCats: NavParent[] = useMemo(() => {
        if (!data.section) return [];
        return nav?.[data.section] ?? [];
    }, [nav, data.section]);

    const names = useMemo(
        () => findNames(nav, data.section, data.category_slug, data.subcategory_slug),
        [nav, data.section, data.category_slug, data.subcategory_slug],
    );

    const reloadFieldDefs = (next: { section: SectionKey; category_slug: string; subcategory_slug?: string }) => {
        const endpoint = fieldDefsEndpoint ?? route('ads.create');
        router.get(endpoint, next, {
            only: ['fieldDefs'],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const pickSection = (s: SectionKey) => {
        setData('section', s);
        setData('category_slug', '');
        setData('subcategory_slug', '');
        setData('attributes', {});
        setOpenParent('');
        setStep(1);
    };

    const pickParentOnly = (p: NavParent) => {
        if (!data.section) return;
        setOpenParent(p.slug);
        setData('category_slug', p.slug);
        setData('subcategory_slug', '');
        setData('attributes', {});
        reloadFieldDefs({ section: data.section, category_slug: p.slug });
    };

    const pickChild = (parent: NavParent, child: NavChild) => {
        if (!data.section) return;
        setOpenParent(parent.slug);
        setData('category_slug', parent.slug);
        setData('subcategory_slug', child.slug);
        setData('attributes', {});
        setStep(2);
        reloadFieldDefs({ section: data.section, category_slug: parent.slug, subcategory_slug: child.slug });
    };

    // Leaf pick (bilatorg/fasteignir): sýna bara children (flatten)
    const leafChoices = useMemo(() => {
        if (!data.section || !isLeafSection) return [];
        const out: Array<{ label: string; icon?: string | null; parentSlug: string; childSlug?: string | null }> = [];

        currentCats.forEach((p) => {
            const kids = p.children ?? [];
            if (kids.length) {
                kids.forEach((c) =>
                    out.push({ label: c.name, icon: c.icon ?? null, parentSlug: p.slug, childSlug: c.slug }),
                );
            } else {
                out.push({ label: p.name, icon: p.icon ?? null, parentSlug: p.slug, childSlug: null });
            }
        });

        return out;
    }, [data.section, isLeafSection, currentCats]);

    const pickLeaf = (choice: { parentSlug: string; childSlug?: string | null }) => {
        if (!data.section) return;
        setData('category_slug', choice.parentSlug);
        setData('subcategory_slug', choice.childSlug ?? '');
        setData('attributes', {});
        setStep(2);
        router.get(
            fieldDefsEndpoint ?? route('ads.create'),
            {
                section: data.section,
                category_slug: choice.parentSlug,
                ...(choice.childSlug ? { subcategory_slug: choice.childSlug } : {}),
            },
            { only: ['fieldDefs'], preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // Solutorg: parent alltaf sýnileg, children fyrir valið parent
    const resolvedParentSlug = useMemo(() => {
        if (isLeafSection) return '';
        return openParent || data.category_slug || (currentCats[0]?.slug ?? '');
    }, [isLeafSection, openParent, data.category_slug, currentCats]);

    const openObj = useMemo(() => {
        if (!resolvedParentSlug) return null;
        return currentCats.find((p) => p.slug === resolvedParentSlug) ?? null;
    }, [currentCats, resolvedParentSlug]);

    useEffect(() => {
        if (!isLeafSection && resolvedParentSlug && !openParent) setOpenParent(resolvedParentSlug);
    }, [isLeafSection, resolvedParentSlug]);

    const groupedFieldDefs = useMemo(() => {
        if (!fieldDefs.length) return [];
        const map = new Map<string, FieldDef[]>();
        for (const f of fieldDefs) {
            const g = (f.group || 'Nánari upplýsingar').trim();
            if (!map.has(g)) map.set(g, []);
            map.get(g)!.push(f);
        }
        return Array.from(map.entries()).map(([group, fields]) => ({ group, fields }));
    }, [fieldDefs]);

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    useEffect(() => {
        const init: Record<string, boolean> = {};
        groupedFieldDefs.forEach((g, idx) => (init[g.group] = idx === 0));
        setOpenGroups(init);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupedFieldDefs.map((g) => g.group).join('|')]);

    const toggleGroup = (group: string) => setOpenGroups((p) => ({ ...p, [group]: !p[group] }));

    // --------------------------
    // Images
    // --------------------------
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [deletePublicIds, setDeletePublicIds] = useState<string[]>([]);
    const [mainPick, setMainPick] = useState<MainPick>(null);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    const remainingExisting = useMemo(() => {
        if (mode !== 'edit') return [];
        return (existingImages ?? []).filter((img) => !deletePublicIds.includes(img.public_id));
    }, [mode, existingImages, deletePublicIds]);

    const totalCount = (mode === 'edit' ? remainingExisting.length : 0) + newFiles.length;

    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    useEffect(() => {
        const urls = newFiles.map((f) => URL.createObjectURL(f));
        setNewPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [newFiles]);

    useEffect(() => {
        if (selectedKey) return;

        if (mode === 'edit' && remainingExisting[0]) {
            setSelectedKey(`e:${remainingExisting[0].public_id}`);
            return;
        }
        if (newFiles[0]) setSelectedKey('n:0');
    }, [selectedKey, mode, remainingExisting, newFiles]);

    useEffect(() => {
        if (mainPick) return;

        if (mode === 'edit') {
            const m = remainingExisting.find((i) => i.is_main) ?? remainingExisting[0];
            if (m) {
                setMainPick({ kind: 'existing', public_id: m.public_id });
                return;
            }
        }
        if (newFiles.length > 0) setMainPick({ kind: 'new', index: 0 });
    }, [mainPick, mode, remainingExisting, newFiles]);

    const fieldDefsKey = useMemo(() => {
        return (fieldDefs ?? [])
            .map((f) => f.key)
            .slice()
            .sort()
            .join('|');
    }, [fieldDefs]);

    useEffect(() => {
        if (!fieldDefs?.length) return;

        const allowed = new Set(fieldDefs.map((f) => f.key));
        const current = data.attributes ?? {};

        const next = Object.fromEntries(
            Object.entries(current).filter(([k]) => allowed.has(k))
        ) as Record<string, any>;

        const currKeys = Object.keys(current);
        const nextKeys = Object.keys(next);

        const changed =
            currKeys.length !== nextKeys.length ||
            currKeys.some((k) => !(k in next));

        if (changed) setData('attributes', next);
    }, [fieldDefsKey, data.attributes]); // ✅

    function addFiles(files: File[]) {
        const incoming = files.filter((f) => f.type.startsWith('image/'));
        if (!incoming.length) return;

        const space = Math.max(0, 15 - totalCount);
        if (space <= 0) return;

        const toAdd = incoming.slice(0, space);
        setNewFiles((prev) => [...prev, ...toAdd]);

        if (!selectedKey) {
            const idx = newFiles.length;
            setSelectedKey(`n:${idx}`);
        }

        if (!mainPick && mode === 'create') setMainPick({ kind: 'new', index: 0 });
    }

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const list = e.target.files;
        if (!list) return;
        addFiles(Array.from(list));
        e.target.value = '';
    }

    function removeSelected() {
        if (!selectedKey) return;

        if (selectedKey.startsWith('e:')) {
            const pid = selectedKey.replace('e:', '');
            setDeletePublicIds((prev) => (prev.includes(pid) ? prev : [...prev, pid]));
            if (mainPick?.kind === 'existing' && mainPick.public_id === pid) setMainPick(null);

            const nextExisting = remainingExisting.filter((x) => x.public_id !== pid);
            if (nextExisting[0]) setSelectedKey(`e:${nextExisting[0].public_id}`);
            else if (newFiles[0]) setSelectedKey('n:0');
            else setSelectedKey(null);

            return;
        }

        if (selectedKey.startsWith('n:')) {
            const idx = Number(selectedKey.replace('n:', ''));
            if (!Number.isFinite(idx)) return;

            setNewFiles((prev) => prev.filter((_, i) => i !== idx));

            if (mainPick?.kind === 'new') {
                if (mainPick.index === idx) setMainPick(null);
                else if (mainPick.index > idx) setMainPick({ kind: 'new', index: mainPick.index - 1 });
            }

            const nextIdx = idx > 0 ? idx - 1 : 0;
            if (newFiles.length > 1) setSelectedKey(`n:${nextIdx}`);
            else if (mode === 'edit' && remainingExisting[0]) setSelectedKey(`e:${remainingExisting[0].public_id}`);
            else setSelectedKey(null);
        }
    }

    function setSelectedAsMain() {
        if (!selectedKey) return;

        if (selectedKey.startsWith('e:')) {
            setMainPick({ kind: 'existing', public_id: selectedKey.replace('e:', '') });
            return;
        }

        if (selectedKey.startsWith('n:')) {
            const idx = Number(selectedKey.replace('n:', ''));
            if (!Number.isFinite(idx)) return;
            setMainPick({ kind: 'new', index: idx });
        }
    }

    const selectedPreview = useMemo(() => {
        if (!selectedKey) return null;

        if (selectedKey.startsWith('e:')) {
            const pid = selectedKey.replace('e:', '');
            const img = remainingExisting.find((x) => x.public_id === pid);
            if (!img) return null;
            return { url: img.url, isMain: mainPick?.kind === 'existing' && mainPick.public_id === pid };
        }

        if (selectedKey.startsWith('n:')) {
            const idx = Number(selectedKey.replace('n:', ''));
            const url = newPreviews[idx];
            if (!url) return null;
            return { url, isMain: mainPick?.kind === 'new' && mainPick.index === idx };
        }

        return null;
    }, [selectedKey, remainingExisting, newPreviews, mainPick]);

    const reviewGroups = useMemo(() => {
        if (!groupedFieldDefs.length) return [];
        return groupedFieldDefs
            .map(({ group, fields }) => {
                const items = fields
                    .map((f) => ({
                        field: f,
                        value: data.attributes?.[f.key],
                    }))
                    .filter(({ field, value }) => hasMeaningfulValue(field, value));

                return { group, items };
            })
            .filter((g) => g.items.length > 0);
    }, [groupedFieldDefs, data.attributes]);

    const goNextFromDetails = () => setStep(3);
    const goNextFromImages = () => setStep(4);
    const goBackFromImages = () => setStep(2);
    const goBackFromReview = () => setStep(3);

    useEffect(() => {
        const keys = Object.keys(errors ?? {});
        if (!keys.length) return;

        if (
            keys.some(
                (k) => k.startsWith('images') || k.includes('main_image') || k.includes('delete_image_public_ids'),
            )
        ) {
            setStep(3);
            return;
        }
        setStep(2);
    }, [errors]);

    const submitFinal = () => {
        form.transform((d) => ({
            ...d,
            images: newFiles,
            main_image_index: mainPick?.kind === 'new' ? mainPick.index : null,
            ...(mode === 'edit'
                ? {
                    _method: 'put' as const,
                    delete_image_public_ids: deletePublicIds,
                    main_image_public_id: mainPick?.kind === 'existing' ? mainPick.public_id : null,
                }
                : {}),
        }));

        post(submitUrl, { preserveScroll: true, forceFormData: true });
        form.transform((d) => d);
    };

    const stepTitle = mode === 'edit' ? 'Breyta auglýsingu' : 'Skrá inn auglýsingu';
    const stepCount = 5;

    const heroSubtext = useMemo(() => {
        const path = [
            data.section ? sectionLabel(data.section as SectionKey) : null,
            names.parentName,
            names.childName,
        ]
            .filter(Boolean)
            .join(' · ');
        const s = `Skref ${Number(step) + 1} af ${stepCount}`;
        return path ? `${path} · ${s}` : s;
    }, [data.section, names.parentName, names.childName, step]);

    const STEP_ITEMS: Array<{ step: Step; label: string }> = [
        { step: 0, label: 'Svæði' },
        { step: 1, label: 'Flokkur' },
        { step: 2, label: 'Upplýsingar' },
        { step: 3, label: 'Myndir' },
        { step: 4, label: 'Forskoðun' },
    ];

    const canJumpTo = (target: Step) => {
        if (target > step) return false; // ekki hoppa áfram
        if (mode === 'edit' && !allowSectionChangeOnEdit && target < 2) return false; // læsa 0-1 í edit
        return true;
    };

    // Dropzone
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (totalCount >= 15) return;
        const files = Array.from(e.dataTransfer.files ?? []);
        addFiles(files);
    };

    return (
        <div className="tt-adform">
            <Hero
                context="section"
                title={stepTitle}
                hideKicker
                ctaHref={null}
                artUrl={heroArtUrl ?? '/i/hero/default.svg'}
                subtextOverride={heroSubtext}
                titleClassName="h3 mb-1"
            >
                <div className="tt-af-steps">
                    {STEP_ITEMS.map((it) => {
                        const disabled = !canJumpTo(it.step);
                        const cls =
                            'tt-af-step rounded-1' +
                            (it.step === step ? ' active' : '') +
                            (it.step < step ? ' done' : '');

                        return (
                            <button
                                key={it.step}
                                type="button"
                                className={cls}
                                disabled={disabled}
                                onClick={() => (!disabled ? setStep(it.step) : null)}
                            >
                                {Number(it.step) + 1}. {it.label}
                            </button>
                        );
                    })}
                </div>
            </Hero>

            {/* Step 0: Section */}
            {step === 0 && (
                <div className="tt-card p-4">
                    <div className="text-muted mb-3">Veldu svæði.</div>

                    <div className="row g-3">
                        {SECTIONS.map((s) => (
                            <div key={s.key} className="col-12 col-md-4">
                                <button
                                    type="button"
                                    className="tt-af-sectile w-100"
                                    onClick={() => pickSection(s.key)}
                                >
                                    <MsIcon icon={s.icon} className="tt-af-sectile-ico" />
                                    <div className="tt-af-sectile-name">{s.title}</div>
                                    <div className="tt-af-sectile-desc">{s.desc}</div>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 1: Category */}
            {step === 1 && (
                <div className="tt-card p-4">
                    {!data.section ? (
                        <div className="text-muted">Veldu svæði fyrst.</div>
                    ) : isLeafSection ? (
                        <>
                            <div className="fw-semibold mb-2">Veldu flokk</div>

                            <div className="tt-grid">
                                {leafChoices.map((c) => (
                                    <button
                                        key={`${c.parentSlug}_${c.childSlug ?? 'p'}`}
                                        type="button"
                                        className="tt-tile"
                                        onClick={() => pickLeaf(c)}
                                    >
                                        <MsIcon icon={c.icon ?? 'category'} className="tt-tile-ico" />
                                        <span className="tt-tile-name">{c.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* ✅ Til baka (var vantað í leaf) */}
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <TTButton type="button" look="ghost" variant="slate" onClick={() => setStep(0)}>
                                    ← Til baka
                                </TTButton>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="fw-semibold mb-2">Veldu flokk</div>

                            {/* Parents row (alltaf sýnileg) */}
                            <div className="tt-grid">
                                {currentCats.map((p) => {
                                    const active = (resolvedParentSlug || '') === p.slug;
                                    return (
                                        <button
                                            key={p.slug}
                                            type="button"
                                            className={`tt-tile ${active ? 'active' : ''}`}
                                            onClick={() => pickParentOnly(p)}
                                        >
                                            <MsIcon icon={p.icon ?? 'category'} className="tt-tile-ico" />
                                            <span className="tt-tile-name">{p.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Children for selected parent */}
                            <div className="tt-af-childwrap mt-3 pt-2">
                                <div className="fw-semibold mb-2">Undirflokkar</div>

                                {openObj && (openObj.children ?? []).length > 0 ? (
                                    <div className="tt-grid">
                                        {(openObj.children ?? []).map((ch) => (
                                            <button
                                                key={ch.slug}
                                                type="button"
                                                className="tt-tile"
                                                onClick={() => pickChild(openObj, ch)}
                                            >
                                                <MsIcon icon={ch.icon ?? 'category'} className="tt-tile-ico" />
                                                <span className="tt-tile-name">{ch.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-muted small">Engir undirflokkar — þú getur haldið áfram.</div>
                                )}

                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <TTButton type="button" look="ghost" variant="slate" onClick={() => setStep(0)}>
                                        ← Til baka
                                    </TTButton>

                                    <TTButton
                                        type="button"
                                        variant="amber"
                                        look="solid"
                                        onClick={() => setStep(2)}
                                        disabled={!data.category_slug || processing}
                                    >
                                        Halda áfram →
                                    </TTButton>
                                </div>
                            </div>
                        </>
                    )}

                    {err('section') && <div className="text-danger small mt-3">{err('section')}</div>}
                    {err('category_slug') && <div className="text-danger small mt-1">{err('category_slug')}</div>}
                    {err('subcategory_slug') && <div className="text-danger small mt-1">{err('subcategory_slug')}</div>}
                </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
                <div className="tt-card p-4">
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                        <div>
                            <div className="fw-semibold">Upplýsingar</div>
                            {isVehicleSection ? (
                                <div className="text-muted small">Bílatorg: “Óskast” er ekki í boði.</div>
                            ) : null}
                        </div>
                    </div>

                    <hr className="my-3" />

                    <form onSubmit={(e) => e.preventDefault()} noValidate>
                        <div className={`mb-3 ${isVehicleSection ? 'd-none' : ''}`}>
                            <label className="form-label small text-muted mb-1">Tegund</label>
                            <div className="tt-af-seg">
                                <button
                                    type="button"
                                    className={`tt-af-segbtn ${data.listing_type === 'sell' ? 'active' : ''}`}
                                    onClick={() => setData('listing_type', 'sell')}
                                >
                                    Til sölu
                                </button>
                                <button
                                    type="button"
                                    className={`tt-af-segbtn ${data.listing_type === 'want' ? 'active' : ''} ${
                                        isVehicleSection ? 'disabled' : ''
                                    }`}
                                    onClick={() => (!isVehicleSection ? setData('listing_type', 'want') : null)}
                                    aria-disabled={isVehicleSection ? 'true' : 'false'}
                                >
                                    Óskast
                                </button>
                            </div>
                            {err('listing_type') && <div className="text-danger small mt-1">{err('listing_type')}</div>}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">
                                Fyrirsögn
                            </label>
                            <input
                                id="title"
                                className={`form-control tt-input ${err('title') ? 'is-invalid' : ''}`}
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder={
                                    isVehicleSection ? 't.d. Toyota Hilux 2018 – Dísel – 33"' : 't.d. iPhone / Sófi / Þvottavél'
                                }
                                required
                            />
                            {err('title') && <div className="invalid-feedback">{err('title')}</div>}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="price" className="form-label">
                                Verð
                            </label>
                            <input
                                id="price"
                                inputMode="numeric"
                                className={`form-control tt-input ${err('price') ? 'is-invalid' : ''}`}
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value.replace(/[^\d]/g, ''))}
                                placeholder="tómt = á samkomulagi"
                            />
                            {err('price') && <div className="invalid-feedback">{err('price')}</div>}
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-12 col-md-6">
                                <label htmlFor="region_id" className="form-label">
                                    Svæði
                                </label>
                                <select
                                    id="region_id"
                                    className="form-select tt-input"
                                    value={regionId}
                                    onChange={(e) => {
                                        setRegionId(e.target.value);
                                        setData('postcode_id', '');
                                    }}
                                >
                                    <option value="">Veldu svæði…</option>
                                    {regions.map((region) => (
                                        <option key={region.id} value={region.id}>
                                            {region.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 col-md-6">
                                <label htmlFor="postcode_id" className="form-label">
                                    Póstnúmer
                                </label>
                                <select
                                    id="postcode_id"
                                    className={`form-select tt-input ${err('postcode_id') ? 'is-invalid' : ''}`}
                                    value={data.postcode_id}
                                    onChange={(e) =>
                                        setData('postcode_id', e.target.value ? Number(e.target.value) : '')
                                    }
                                    disabled={!filteredPostcodes.length}
                                >
                                    <option value="">Veldu póstnúmer…</option>
                                    {filteredPostcodes.map((pc) => (
                                        <option key={pc.id} value={pc.id}>
                                            {pc.code} {pc.name ? `· ${pc.name}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {err('postcode_id') && <div className="invalid-feedback">{err('postcode_id')}</div>}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="location_text" className="form-label">
                                Staðsetning (frjálst)
                            </label>
                            <input
                                id="location_text"
                                className={`form-control tt-input ${err('location_text') ? 'is-invalid' : ''}`}
                                value={data.location_text}
                                onChange={(e) => setData('location_text', e.target.value)}
                                placeholder="t.d. Reykjavík, Akranes eða 'Sendi'"
                            />
                            {err('location_text') && <div className="invalid-feedback">{err('location_text')}</div>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="description" className="form-label">
                                Lýsing
                            </label>
                            <textarea
                                id="description"
                                className={`form-control tt-input ${err('description') ? 'is-invalid' : ''}`}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={5}
                            />
                            {err('description') && <div className="invalid-feedback">{err('description')}</div>}
                        </div>

                        {groupedFieldDefs.length > 0 && (
                            <div className="mb-4">
                                <div className="fw-semibold mb-2">Nánari upplýsingar</div>

                                <div className="d-grid gap-2">
                                    {groupedFieldDefs.map(({ group, fields }) => {
                                        const isOpen = !!openGroups[group];
                                        return (
                                            <div key={group} className="tt-af-group">
                                                <button
                                                    type="button"
                                                    className="tt-af-group__head"
                                                    onClick={() => toggleGroup(group)}
                                                    aria-expanded={isOpen ? 'true' : 'false'}
                                                >
                                                    <div className="fw-semibold">{group}</div>
                                                    <span className="text-muted small">{isOpen ? 'Fela' : 'Sýna'}</span>
                                                </button>

                                                {isOpen ? (
                                                    <div className="tt-af-group__body">
                                                        <div className="row g-3">
                                                            {fields.map((f) => {
                                                                const fieldError = err(`attributes.${f.key}`);
                                                                const value =
                                                                    data.attributes?.[f.key] ??
                                                                    (f.type === 'boolean'
                                                                        ? false
                                                                        : f.type === 'multiselect'
                                                                            ? []
                                                                            : '');

                                                                if (f.type === 'textarea') {
                                                                    return (
                                                                        <div key={f.key} className="col-12">
                                                                            <label className="form-label">
                                                                                {f.label}{' '}
                                                                                {f.required ? <span className="text-danger">*</span> : null}
                                                                            </label>
                                                                            <textarea
                                                                                className={`form-control tt-input ${
                                                                                    fieldError ? 'is-invalid' : ''
                                                                                }`}
                                                                                value={value}
                                                                                onChange={(e) =>
                                                                                    setData('attributes', {
                                                                                        ...data.attributes,
                                                                                        [f.key]: e.target.value,
                                                                                    })
                                                                                }
                                                                                rows={4}
                                                                                placeholder={f.placeholder}
                                                                            />
                                                                            {f.help && <div className="form-text">{f.help}</div>}
                                                                            {fieldError && <div className="invalid-feedback">{fieldError}</div>}
                                                                        </div>
                                                                    );
                                                                }

                                                                if (f.type === 'select') {
                                                                    const colClass = f.key.startsWith('tire_')
                                                                        ? 'col-12 col-md-4'
                                                                        : 'col-12 col-md-6';
                                                                    return (
                                                                        <div key={f.key} className={colClass}>
                                                                            <label className="form-label">
                                                                                {f.label}{' '}
                                                                                {f.required ? <span className="text-danger">*</span> : null}
                                                                            </label>
                                                                            <select
                                                                                className={`form-select tt-input ${
                                                                                    fieldError ? 'is-invalid' : ''
                                                                                }`}
                                                                                value={value}
                                                                                onChange={(e) =>
                                                                                    setData('attributes', {
                                                                                        ...data.attributes,
                                                                                        [f.key]: e.target.value,
                                                                                    })
                                                                                }
                                                                            >
                                                                                <option value="">Veldu…</option>
                                                                                {(f.options ?? []).map((o) => (
                                                                                    <option key={o.value} value={o.value}>
                                                                                        {o.label}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            {f.help && <div className="form-text">{f.help}</div>}
                                                                            {fieldError && <div className="invalid-feedback">{fieldError}</div>}
                                                                        </div>
                                                                    );
                                                                }

                                                                if (f.type === 'boolean') {
                                                                    return (
                                                                        <div key={f.key} className="col-12 col-md-6">
                                                                            <div className="form-check mt-2">
                                                                                <input
                                                                                    className="form-check-input"
                                                                                    type="checkbox"
                                                                                    id={f.key}
                                                                                    checked={Boolean(value)}
                                                                                    onChange={(e) =>
                                                                                        setData('attributes', {
                                                                                            ...data.attributes,
                                                                                            [f.key]: e.target.checked,
                                                                                        })
                                                                                    }
                                                                                />
                                                                                <label className="form-check-label" htmlFor={f.key}>
                                                                                    {f.label}
                                                                                </label>
                                                                                {f.help && <div className="form-text">{f.help}</div>}
                                                                                {fieldError && (
                                                                                    <div className="text-danger small mt-1">{fieldError}</div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }

                                                                if (f.type === 'multiselect') {
                                                                    const current: string[] = Array.isArray(value) ? value : [];
                                                                    return (
                                                                        <div key={f.key} className="col-12">
                                                                            <label className="form-label">{f.label}</label>

                                                                            <div className="row g-2">
                                                                                {(f.options ?? []).map((o) => {
                                                                                    const checked = current.includes(o.value);
                                                                                    return (
                                                                                        <div
                                                                                            key={o.value}
                                                                                            className="col-12 col-md-6 col-lg-4"
                                                                                        >
                                                                                            <div className="form-check">
                                                                                                <input
                                                                                                    className="form-check-input"
                                                                                                    type="checkbox"
                                                                                                    id={`${f.key}_${o.value}`}
                                                                                                    checked={checked}
                                                                                                    onChange={(e) => {
                                                                                                        const next = e.target.checked
                                                                                                            ? [...current, o.value]
                                                                                                            : current.filter((x) => x !== o.value);

                                                                                                        setData('attributes', {
                                                                                                            ...data.attributes,
                                                                                                            [f.key]: next,
                                                                                                        });
                                                                                                    }}
                                                                                                />
                                                                                                <label
                                                                                                    className="form-check-label"
                                                                                                    htmlFor={`${f.key}_${o.value}`}
                                                                                                >
                                                                                                    {o.label}
                                                                                                </label>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>

                                                                            {f.help && <div className="form-text">{f.help}</div>}
                                                                            {fieldError && (
                                                                                <div className="text-danger small mt-1">{fieldError}</div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }

                                                                const colClass = f.key.startsWith('tire_')
                                                                    ? 'col-12 col-md-4'
                                                                    : 'col-12 col-md-6';

                                                                return (
                                                                    <div key={f.key} className={colClass}>
                                                                        <label className="form-label">
                                                                            {f.label}{' '}
                                                                            {f.required ? <span className="text-danger">*</span> : null}
                                                                        </label>

                                                                        <div className={f.unit ? 'input-group' : ''}>
                                                                            <input
                                                                                className={`form-control tt-input ${
                                                                                    fieldError ? 'is-invalid' : ''
                                                                                }`}
                                                                                value={value}
                                                                                inputMode={f.type === 'number' ? 'numeric' : undefined}
                                                                                onChange={(e) =>
                                                                                    setData('attributes', {
                                                                                        ...data.attributes,
                                                                                        [f.key]: e.target.value,
                                                                                    })
                                                                                }
                                                                                placeholder={f.placeholder}
                                                                            />
                                                                            {f.unit ? <span className="input-group-text">{f.unit}</span> : null}
                                                                            {fieldError && <div className="invalid-feedback">{fieldError}</div>}
                                                                        </div>

                                                                        {f.help && <div className="form-text">{f.help}</div>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex gap-2">
                                {mode !== 'edit' && mode !== 'create' ? (
                                    <TTButton type="button" look="ghost" variant="slate" onClick={() => setStep(1)}>
                                        ← Til baka
                                    </TTButton>
                                ) : null }

                                {mode === 'create' ? (
                                    <TTButton type="button" look="ghost" variant="slate" onClick={() => setStep(1)}>
                                        ← Byrja uppá nýtt
                                    </TTButton>
                                ) : null }
                            </div>


                            <TTButton
                                type="button"
                                variant="amber"
                                look="solid"
                                onClick={goNextFromDetails}
                                disabled={processing}
                            >
                                Næsta: Myndir →
                            </TTButton>
                        </div>
                    </form>
                </div>
            )}

            {/* Step 3: Images */}
            {step === 3 && (
                <div className="tt-card p-4">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <div className="fw-semibold mb-1">Myndir</div>
                            <div className="text-muted small">
                                Dragðu inn eða smelltu · Allt að 15 myndir ·{' '}
                                <span className={totalCount >= 15 ? 'text-danger fw-semibold' : 'fw-semibold'}>
                                    {totalCount}/15
                                </span>
                            </div>
                        </div>
                    </div>

                    <hr className="my-3" />

                    {err('images') && <div className="alert alert-danger py-2 small">{err('images')}</div>}
                    {Object.keys(errors ?? {}).some((k) => k.startsWith('images.')) && (
                        <div className="alert alert-danger py-2 small">Ein eða fleiri myndir eru ógildar.</div>
                    )}

                    <div
                        className={`tt-af-drop ${dragOver ? 'drag' : ''} ${totalCount >= 15 ? 'disabled' : ''}`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (totalCount < 15) setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={onDrop}
                        onClick={() => (totalCount < 15 ? fileInputRef.current?.click() : null)}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div className="tt-af-drop__ico">
                                <MsIcon icon="cloud_upload" />
                            </div>
                            <div>
                                <div className="fw-semibold">Settu myndir inn</div>
                                <div className="text-muted small">
                                    Dragðu skrár hingað eða smelltu til að velja (JPG/PNG/WebP).
                                </div>
                            </div>
                            <div className="ms-auto d-none d-md-block">
                                <TTButton
                                    type="button"
                                    size="sm"
                                    look="ghost"
                                    variant="slate"
                                    className="pointer-events-none"
                                    tabIndex={-1}
                                >
                                    Velja myndir
                                </TTButton>
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="d-none"
                            onChange={onInputChange}
                            disabled={totalCount >= 15}
                        />
                    </div>

                    <div className="row g-3 mt-3">
                        <div className="col-12 col-lg-7">
                            {selectedPreview ? (
                                <div className="tt-af-preview">
                                    <img
                                        src={selectedPreview.url}
                                        alt="Forskoðun"
                                        className="img-fluid rounded-4 w-100 bg-white"
                                        style={{ maxHeight: 420, objectFit: 'contain' }}
                                    />

                                    <div className="d-flex gap-2 mt-2">
                                        <TTButton
                                            type="button"
                                            size="sm"
                                            variant="green"
                                            look="solid"
                                            onClick={setSelectedAsMain}
                                            disabled={totalCount === 0}
                                        >
                                            Setja sem aðalmynd
                                        </TTButton>

                                        <TTButton
                                            type="button"
                                            size="sm"
                                            variant="red"
                                            look="solid"
                                            onClick={removeSelected}
                                            disabled={!selectedKey}
                                        >
                                            Fjarlægja
                                        </TTButton>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted small">Engin mynd valin.</div>
                            )}
                        </div>

                        <div className="col-12 col-lg-5">
                            {mode !== 'edit' ? (
                                newFiles.length > 0 ? (
                                    <>
                                        <div className="text-muted small mb-2">Smámyndir</div>
                                        <div className="d-flex flex-wrap gap-2">
                                            {newFiles.map((_, idx) => {
                                                const url = newPreviews[idx];
                                                const isSelected = selectedKey === `n:${idx}`;
                                                const isMain = mainPick?.kind === 'new' && mainPick.index === idx;

                                                return (
                                                    <button
                                                        key={`n:${idx}`}
                                                        type="button"
                                                        className={`tt-af-thumb ${isSelected ? 'active' : ''} ${
                                                            isMain ? 'main' : ''
                                                        }`}
                                                        style={{ width: 76, height: 76 }}
                                                        onClick={() => setSelectedKey(`n:${idx}`)}
                                                        title={isMain ? 'Aðalmynd' : 'Mynd'}
                                                    >
                                                        <img
                                                            src={url}
                                                            alt=""
                                                            className="w-100 h-100 rounded-3"
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-muted small">Engar myndir ennþá.</div>
                                )
                            ) : remainingExisting.length > 0 || newFiles.length > 0 ? (
                                <>
                                    <div className="text-muted small mb-2">Smámyndir</div>

                                    <div className="d-flex flex-wrap gap-2">
                                        {remainingExisting.map((img) => {
                                            const isSelected = selectedKey === `e:${img.public_id}`;
                                            const isMain = mainPick?.kind === 'existing' && mainPick.public_id === img.public_id;
                                            return (
                                                <button
                                                    key={img.public_id}
                                                    type="button"
                                                    className={`tt-af-thumb ${isSelected ? 'active' : ''} ${
                                                        isMain ? 'main' : ''
                                                    }`}
                                                    style={{ width: 76, height: 76 }}
                                                    onClick={() => setSelectedKey(`e:${img.public_id}`)}
                                                    title={isMain ? 'Aðalmynd' : 'Mynd'}
                                                >
                                                    <img
                                                        src={img.url}
                                                        alt=""
                                                        className="w-100 h-100 rounded-3"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </button>
                                            );
                                        })}

                                        {newFiles.map((_, idx) => {
                                            const url = newPreviews[idx];
                                            const isSelected = selectedKey === `n:${idx}`;
                                            const isMain = mainPick?.kind === 'new' && mainPick.index === idx;

                                            return (
                                                <button
                                                    key={`n:${idx}`}
                                                    type="button"
                                                    className={`tt-af-thumb ${isSelected ? 'active' : ''} ${isMain ? 'main' : ''}`}
                                                    style={{ width: 76, height: 76 }}
                                                    onClick={() => setSelectedKey(`n:${idx}`)}
                                                    title={isMain ? 'Aðalmynd' : 'Mynd'}
                                                >
                                                    <img
                                                        src={url}
                                                        alt=""
                                                        className="w-100 h-100 rounded-3"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="text-muted small">Engar myndir ennþá.</div>
                            )}
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <TTButton type="button" look="ghost" variant="slate" onClick={goBackFromImages}>
                            ← Til baka
                        </TTButton>

                        <TTButton type="button" variant="amber" look="solid" onClick={goNextFromImages} disabled={processing}>
                            Næsta: Forskoðun →
                        </TTButton>
                    </div>
                </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
                <div className="tt-card p-4">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <div className="fw-semibold mb-1">Forskoðun</div>
                            <div className="text-muted small">Athugaðu allt áður en þú birtir/vistar.</div>
                        </div>
                    </div>

                    <hr className="my-3" />

                    <div className="row g-4">
                        <div className="col-12 col-lg-7">
                            <div className="tt-af-box mb-3">
                                <div className="tt-af-k">Titill</div>
                                <div className="fw-bold fs-5">{data.title || '—'}</div>

                                <hr className="my-3" />

                                <div className="d-flex flex-wrap gap-3">
                                    <div>
                                        <div className="tt-af-k">Tegund</div>
                                        <div>{data.listing_type === 'sell' ? 'Til sölu' : 'Óskast'}</div>
                                    </div>
                                    <div>
                                        <div className="tt-af-k">Verð</div>
                                        <div>{formatISK(data.price)}</div>
                                    </div>
                                    <div>
                                        <div className="tt-af-k">Staðsetning</div>
                                        <div>{locationSummary || '—'}</div>
                                    </div>
                                    <div>
                                        <div className="tt-af-k">Flokkur</div>
                                        <div>
                                            {[
                                                data.section ? sectionLabel(data.section) : null,
                                                names.parentName,
                                                names.childName,
                                            ]
                                                .filter(Boolean)
                                                .join(' · ') || '—'}
                                        </div>
                                    </div>
                                </div>

                                <hr className="my-3" />

                                <div className="tt-af-k">Lýsing</div>
                                <div style={{ whiteSpace: 'pre-wrap' }}>{data.description || '—'}</div>
                            </div>

                            {reviewGroups.length > 0 ? (
                                <div className="tt-af-box">
                                    <div className="fw-semibold mb-2">Nánari upplýsingar</div>

                                    <div className="d-grid gap-3">
                                        {reviewGroups.map(({ group, items }) => (
                                            <div key={group}>
                                                <div className="tt-af-k mb-2">{group}</div>
                                                <div className="row g-3">
                                                    {items.map(({ field, value }) => (
                                                        <div
                                                            key={field.key}
                                                            className={field.type === 'multiselect' ? 'col-12' : 'col-12 col-md-6'}
                                                        >
                                                            <div className="tt-af-k mb-1">{field.label}</div>
                                                            <div>{renderReviewAttrValue(field, value)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="col-12 col-lg-5">
                            <div className="tt-af-box">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <div className="tt-af-k">Myndir</div>
                                    <div className="text-muted small">{totalCount}/15</div>
                                </div>

                                <div className="d-flex flex-wrap gap-2">
                                    {mode === 'edit' &&
                                        remainingExisting.map((img) => {
                                            const isMain =
                                                mainPick?.kind === 'existing' && mainPick.public_id === img.public_id;
                                            return (
                                                <div key={img.public_id} className={`tt-af-miniimg ${isMain ? 'main' : ''}`}>
                                                    <img src={img.url} alt="" />
                                                    {isMain ? <span className="tt-af-tag">Aðal</span> : null}
                                                </div>
                                            );
                                        })}

                                    {newPreviews.map((url, idx) => {
                                        const isMain = mainPick?.kind === 'new' && mainPick.index === idx;
                                        return (
                                            <div key={idx} className={`tt-af-miniimg ${isMain ? 'main' : ''}`}>
                                                <img src={url} alt="" />
                                                {isMain ? <span className="tt-af-tag">Aðal</span> : null}
                                            </div>
                                        );
                                    })}

                                    {totalCount === 0 && <div className="text-muted small">Engar myndir.</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <TTButton type="button" look="ghost" variant="slate" onClick={goBackFromReview}>
                            ← Til baka
                        </TTButton>

                        <TTButton type="button" variant="amber" look="solid" onClick={submitFinal} disabled={processing}>
                            {processing ? 'Vista…' : mode === 'edit' ? 'Vista breytingar' : 'Birta auglýsingu'}
                        </TTButton>
                    </div>
                </div>
            )}
        </div>
    );
}
