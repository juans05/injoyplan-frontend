// Shapes returned by the NestJS backend (auth/login, auth/me)

export interface IProfile {
    avatar?: string | null
    coverImage?: string | null
    description?: string | null
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
    city?: string | null
    country?: string | null
    gender?: string | null
    birthDate?: string | null
}

export interface IUser {
    id: string
    email: string
    username?: string | null
    userType: 'NORMAL' | 'COMPANY'
    // Present in auth/me; only in auth/login responses from newer backends
    role?: 'USER' | 'ADMIN'
    isVerified?: boolean
    profile?: IProfile | null
}

export interface LoginResponse {
    user?: IUser
    accessToken?: string
    refreshToken?: string
    message?: string
}

export interface IEmail {
    correo: string
}

// Request bodies (mirror the backend DTOs)
export interface LoginInput {
    email: string
    password: string
}

export interface RegisterInput {
    email: string
    password: string
    userType?: 'NORMAL' | 'COMPANY'
    nombre?: string
    apellido?: string
    genero?: string
    f_nacimiento?: string
    imagenPerfil?: string
    terminoCondiciones?: boolean
    politica?: boolean
}

export interface ResetPasswordInput {
    token: string
    newPassword: string
}
