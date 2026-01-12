import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AdImageController::show
* @see app/Http/Controllers/AdImageController.php:10
* @route '/i/{adImage}'
*/
export const show = (args: { adImage: string | number | { public_id: string | number } } | [adImage: string | number | { public_id: string | number } ] | string | number | { public_id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/i/{adImage}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdImageController::show
* @see app/Http/Controllers/AdImageController.php:10
* @route '/i/{adImage}'
*/
show.url = (args: { adImage: string | number | { public_id: string | number } } | [adImage: string | number | { public_id: string | number } ] | string | number | { public_id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { adImage: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'public_id' in args) {
        args = { adImage: args.public_id }
    }

    if (Array.isArray(args)) {
        args = {
            adImage: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        adImage: typeof args.adImage === 'object'
        ? args.adImage.public_id
        : args.adImage,
    }

    return show.definition.url
            .replace('{adImage}', parsedArgs.adImage.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdImageController::show
* @see app/Http/Controllers/AdImageController.php:10
* @route '/i/{adImage}'
*/
show.get = (args: { adImage: string | number | { public_id: string | number } } | [adImage: string | number | { public_id: string | number } ] | string | number | { public_id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdImageController::show
* @see app/Http/Controllers/AdImageController.php:10
* @route '/i/{adImage}'
*/
show.head = (args: { adImage: string | number | { public_id: string | number } } | [adImage: string | number | { public_id: string | number } ] | string | number | { public_id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

const AdImageController = { show }

export default AdImageController