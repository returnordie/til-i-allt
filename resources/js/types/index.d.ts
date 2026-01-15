export interface User {
    id: number;
    name: string;
    email: string;
    username?: string | null;
    role?: string;
    show_name?: boolean;
    show_phone?: boolean;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
