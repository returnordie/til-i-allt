import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
/**
* @see \App\Http\Controllers\AdController::index
* @see app/Http/Controllers/AdController.php:12
* @route '/{section}/{categorySlug}'
*/
export const index = (args: { section: string | number, categorySlug: string | number } | [section: string | number, categorySlug: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{section}/{categorySlug}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdController::index
* @see app/Http/Controllers/AdController.php:12
* @route '/{section}/{categorySlug}'
*/
index.url = (args: { section: string | number, categorySlug: string | number } | [section: string | number, categorySlug: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            section: args[0],
            categorySlug: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        section: args.section,
        categorySlug: args.categorySlug,
    }

    return index.definition.url
            .replace('{section}', parsedArgs.section.toString())
            .replace('{categorySlug}', parsedArgs.categorySlug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdController::index
* @see app/Http/Controllers/AdController.php:12
* @route '/{section}/{categorySlug}'
*/
index.get = (args: { section: string | number, categorySlug: string | number } | [section: string | number, categorySlug: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdController::index
* @see app/Http/Controllers/AdController.php:12
* @route '/{section}/{categorySlug}'
*/
index.head = (args: { section: string | number, categorySlug: string | number } | [section: string | number, categorySlug: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AdController::show
* @see app/Http/Controllers/AdController.php:48
* @route '/{section}/{categorySlug}/{ad}-{slug?}'
*/
export const show = (args: { section: string | number, categorySlug: string | number, ad: number | { id: number }, slug?: string | number } | [section: string | number, categorySlug: string | number, ad: number | { id: number }, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/{section}/{categorySlug}/{ad}-{slug?}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdController::show
* @see app/Http/Controllers/AdController.php:48
* @route '/{section}/{categorySlug}/{ad}-{slug?}'
*/
show.url = (args: { section: string | number, categorySlug: string | number, ad: number | { id: number }, slug?: string | number } | [section: string | number, categorySlug: string | number, ad: number | { id: number }, slug: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            section: args[0],
            categorySlug: args[1],
            ad: args[2],
            slug: args[3],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "slug",
    ])

    const parsedArgs = {
        section: args.section,
        categorySlug: args.categorySlug,
        ad: typeof args.ad === 'object'
        ? args.ad.id
        : args.ad,
        slug: args.slug,
    }

    return show.definition.url
            .replace('{section}', parsedArgs.section.toString())
            .replace('{categorySlug}', parsedArgs.categorySlug.toString())
            .replace('{ad}', parsedArgs.ad.toString())
            .replace('{slug?}', parsedArgs.slug?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdController::show
* @see app/Http/Controllers/AdController.php:48
* @route '/{section}/{categorySlug}/{ad}-{slug?}'
*/
show.get = (args: { section: string | number, categorySlug: string | number, ad: number | { id: number }, slug?: string | number } | [section: string | number, categorySlug: string | number, ad: number | { id: number }, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdController::show
* @see app/Http/Controllers/AdController.php:48
* @route '/{section}/{categorySlug}/{ad}-{slug?}'
*/
show.head = (args: { section: string | number, categorySlug: string | number, ad: number | { id: number }, slug?: string | number } | [section: string | number, categorySlug: string | number, ad: number | { id: number }, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AdController::create
* @see app/Http/Controllers/AdController.php:0
* @route '/ads/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/ads/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdController::create
* @see app/Http/Controllers/AdController.php:0
* @route '/ads/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdController::create
* @see app/Http/Controllers/AdController.php:0
* @route '/ads/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdController::create
* @see app/Http/Controllers/AdController.php:0
* @route '/ads/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AdController::store
* @see app/Http/Controllers/AdController.php:0
* @route '/ads'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/ads',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdController::store
* @see app/Http/Controllers/AdController.php:0
* @route '/ads'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdController::store
* @see app/Http/Controllers/AdController.php:0
* @route '/ads'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AdController::edit
* @see app/Http/Controllers/AdController.php:0
* @route '/ads/{ad}/edit'
*/
export const edit = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/ads/{ad}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdController::edit
* @see app/Http/Controllers/AdController.php:0
* @route '/ads/{ad}/edit'
*/
edit.url = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ad: args }
    }

    if (Array.isArray(args)) {
        args = {
            ad: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        ad: args.ad,
    }

    return edit.definition.url
            .replace('{ad}', parsedArgs.ad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdController::edit
* @see app/Http/Controllers/AdController.php:0
* @route '/ads/{ad}/edit'
*/
edit.get = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdController::edit
* @see app/Http/Controllers/AdController.php:0
* @route '/ads/{ad}/edit'
*/
edit.head = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AdController::update
* @see app/Http/Controllers/AdController.php:0
* @route '/ads/{ad}'
*/
export const update = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/ads/{ad}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\AdController::update
* @see app/Http/Controllers/AdController.php:0
* @route '/ads/{ad}'
*/
update.url = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ad: args }
    }

    if (Array.isArray(args)) {
        args = {
            ad: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        ad: args.ad,
    }

    return update.definition.url
            .replace('{ad}', parsedArgs.ad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdController::update
* @see app/Http/Controllers/AdController.php:0
* @route '/ads/{ad}'
*/
update.put = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\AdController::destroy
* @see app/Http/Controllers/AdController.php:0
* @route '/ads/{ad}'
*/
export const destroy = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/ads/{ad}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AdController::destroy
* @see app/Http/Controllers/AdController.php:0
* @route '/ads/{ad}'
*/
destroy.url = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ad: args }
    }

    if (Array.isArray(args)) {
        args = {
            ad: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        ad: args.ad,
    }

    return destroy.definition.url
            .replace('{ad}', parsedArgs.ad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdController::destroy
* @see app/Http/Controllers/AdController.php:0
* @route '/ads/{ad}'
*/
destroy.delete = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\AdReportController::report
* @see [unknown]:0
* @route '/ads/{ad}/report'
*/
export const report = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: report.url(args, options),
    method: 'post',
})

report.definition = {
    methods: ["post"],
    url: '/ads/{ad}/report',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdReportController::report
* @see [unknown]:0
* @route '/ads/{ad}/report'
*/
report.url = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ad: args }
    }

    if (Array.isArray(args)) {
        args = {
            ad: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        ad: args.ad,
    }

    return report.definition.url
            .replace('{ad}', parsedArgs.ad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdReportController::report
* @see [unknown]:0
* @route '/ads/{ad}/report'
*/
report.post = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: report.url(args, options),
    method: 'post',
})

const ads = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    report: Object.assign(report, report),
}

export default ads