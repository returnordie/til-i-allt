import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AdReportController::store
* @see [unknown]:0
* @route '/ads/{ad}/report'
*/
export const store = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/ads/{ad}/report',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdReportController::store
* @see [unknown]:0
* @route '/ads/{ad}/report'
*/
store.url = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{ad}', parsedArgs.ad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdReportController::store
* @see [unknown]:0
* @route '/ads/{ad}/report'
*/
store.post = (args: { ad: string | number } | [ad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

const AdReportController = { store }

export default AdReportController