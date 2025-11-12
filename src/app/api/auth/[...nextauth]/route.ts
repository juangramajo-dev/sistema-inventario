import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Creamos el handler usando las opciones importadas
const handler = NextAuth(authOptions);

// Exportamos el handler como GET y POST
export { handler as GET, handler as POST };
