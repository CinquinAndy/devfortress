import { z } from 'zod'

const envSchema = z.object({
	// Data file path
	DATA_FILE_PATH: z.string().default('./data/ODCAF_v1.0.csv'),

	// Server
	PORT: z.coerce.number().default(3000),
	HOST: z.string().default('0.0.0.0'),
	PUBLIC_URL: z.string().optional(), // Public URL for widget resources (e.g., https://odcaf.example.com)
})

export type Env = z.infer<typeof envSchema>

export function loadEnv(): Env {
	const result = envSchema.safeParse(process.env)

	if (!result.success) {
		console.error('Invalid environment variables:')
		console.error(result.error.format())
		process.exit(1)
	}

	return result.data
}

export const env = loadEnv()
