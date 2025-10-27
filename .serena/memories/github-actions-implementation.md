# GitHub Actions Implementation

## Workflow Strategy
- **CI Workflow**: Runs on all PRs and main branch pushes
- **PR Validation**: Additional checks specific to pull requests
- **Test Suite**: Lint + Type-check + Build validation

## Project Configuration
- Package Manager: pnpm
- Node Version: 20.x (LTS)
- Linter: Biome
- Type Checker: TypeScript 5.7.0
- Framework: Next.js 15.1.6

## Available Scripts
- `pnpm lint`: Biome linting
- `pnpm type-check`: TypeScript validation
- `pnpm build`: Next.js production build

## Environment Variables Needed
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- (Stored in GitHub Secrets)
