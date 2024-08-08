import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
    publicRoutes: ['/', '/auth(.*)', '/portal(.*)', '/images(.*)'],
    ignoredRoutes: ['/chatbot' , '/blog(.*)' , ],
})
// , '/settings(.*)'
export const config = {
    matcher: ['/((?!.+.[w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}