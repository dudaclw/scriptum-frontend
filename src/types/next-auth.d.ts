import type { DefaultSession } from "next-auth";

// O provider de credenciais devolve o token do backend e o id do usuário.
// Sem esta augmentation, `session.accessToken` e `session.user.id` não existem
// nos tipos padrão do NextAuth.
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: {
      id?: string;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
  }
}
