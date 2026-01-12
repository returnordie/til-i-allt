import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\DealReviewController::store
* @see [unknown]:0
* @route '/deals/{deal}/reviews'
*/
export const store = (args: { deal: string | number } | [deal: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/deals/{deal}/reviews',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DealReviewController::store
* @see [unknown]:0
* @route '/deals/{deal}/reviews'
*/
store.url = (args: { deal: string | number } | [deal: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { deal: args }
    }

    if (Array.isArray(args)) {
        args = {
            deal: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        deal: args.deal,
    }

    return store.definition.url
            .replace('{deal}', parsedArgs.deal.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DealReviewController::store
* @see [unknown]:0
* @route '/deals/{deal}/reviews'
*/
store.post = (args: { deal: string | number } | [deal: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

const dealReviews = {
    store: Object.assign(store, store),
}

export default dealReviews