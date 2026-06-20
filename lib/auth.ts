import { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      await prisma.user.upsert({
        where: { email: user.email },
        create: { email: user.email, name: user.name, image: user.image },
        update: { name: user.name, image: user.image },
      })
      return true
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } })
        if (dbUser) token.userId = dbUser.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        ;(session.user as { id?: string }).id = token.userId as string
      }
      return session
    },
  },
  pages: { signIn: '/auth/signin' },
  secret: process.env.NEXTAUTH_SECRET,
}
