import type { NextAuthOptions } from "next-auth"; // Importamos el TIPO
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { Prisma } from "@/generated/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          console.log("Faltan credenciales");
          return null; // Faltan credenciales
        }

        // Usamos SQL crudo para buscar al usuario
        const user = await prisma.$queryRaw<User[]>(
          Prisma.sql`SELECT * FROM User WHERE email = ${credentials.email}`
        );

        if (user.length === 0) {
          console.log("Usuario no encontrado");
          return null; // Usuario no encontrado
        }

        // Comparamos la contraseña
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user[0].password
        );

        if (!passwordMatch) {
          console.log("Contraseña incorrecta");
          return null; // Contraseña incorrecta
        }

        // ¡Éxito! Devolvemos el usuario
        return {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // Usamos JSON Web Tokens
  },
  callbacks: {
    // Este callback añade el ID del usuario al token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // Este callback añade el ID del usuario a la SESIÓN
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; // Añadimos el ID del token
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Página de login personalizada
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Definimos un tipo 'User' para el queryRaw (opcional pero buena práctica)
type User = {
  id: string;
  name: string | null;
  email: string;
  password: string;
};
