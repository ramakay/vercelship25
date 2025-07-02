# Secure Deployment with OIDC Federation

This guide shows how to enhance security using Vercel's OIDC federation feature to avoid storing long-lived API keys.

## Current Setup (Basic)

The project currently uses a traditional API key stored in environment variables:

```env
AI_GATEWAY_API_KEY=your_key_here
```

## Enhanced Security with OIDC (Recommended)

Vercel provides OIDC federation on all plans, which issues short-lived tokens instead of requiring long-lived credentials.

### How It Works

1. **Build Time**: Vercel generates an OIDC token available as `VERCEL_OIDC_TOKEN`
2. **Runtime**: Functions receive the token in the `x-vercel-oidc-token` header
3. **Token Lifetime**: Valid for 60 minutes, cached for up to 45 minutes

### Implementation Pattern

```typescript
// In your API route or function
export async function GET(request: Request) {
  // Get OIDC token from header
  const oidcToken = request.headers.get('x-vercel-oidc-token');
  
  if (!oidcToken) {
    return new Response('No OIDC token', { status: 401 });
  }
  
  // Exchange OIDC token with your backend for AI Gateway credentials
  const response = await fetch('https://your-secure-api.com/exchange', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${oidcToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      resource: 'ai-gateway',
      permissions: ['read', 'write']
    })
  });
  
  const { aiGatewayKey } = await response.json();
  
  // Use the temporary key with AI Gateway
  const gateway = createGateway({ apiKey: aiGatewayKey });
}
```

### Backend Service Requirements

Your backend service needs to:

1. **Validate OIDC Tokens**: Verify tokens from Vercel's issuer
2. **Check Claims**: Validate project ID, environment, etc.
3. **Issue Temporary Credentials**: Return short-lived AI Gateway keys

### Benefits

- ✅ No long-lived credentials in environment variables
- ✅ Granular access control per environment
- ✅ Automatic credential rotation
- ✅ Works in local development with `vercel env pull`

### Setup Steps

1. **Enable OIDC in Vercel Dashboard**:
   - Go to Project Settings → Security
   - Configure "Secure backend access with OIDC federation"
   - Choose "Team" issuer mode (recommended)

2. **Configure Your Backend**:
   - Trust Vercel's OIDC issuer: `https://oidc.vercel.com/your-team`
   - Validate tokens and claims
   - Implement credential exchange endpoint

3. **Update Your Code**:
   - Use the pattern shown above
   - Remove hardcoded API keys
   - Test with `vercel dev`

### Example Token Claims

```json
{
  "iss": "https://oidc.vercel.com/acme",
  "sub": "prj_xxxxxxxxxxxx",
  "aud": ["urn:vercel:project:prj_xxxxxxxxxxxx"],
  "iat": 1234567890,
  "exp": 1234571490,
  "jti": "unique-token-id",
  "vercel": {
    "projectId": "prj_xxxxxxxxxxxx",
    "teamId": "team_xxxxxxxxxxxx",
    "environment": "production"
  }
}
```

### Local Development

```bash
# Pull OIDC token for local development
vercel env pull

# Token will be in .env.local
cat .env.local | grep VERCEL_OIDC_TOKEN
```

## Migration Path

1. **Phase 1**: Current setup with API key (implemented)
2. **Phase 2**: Add OIDC support alongside API key
3. **Phase 3**: Deprecate direct API key usage
4. **Phase 4**: Remove API key support entirely

## Resources

- [Vercel OIDC Documentation](https://vercel.com/docs/security/secure-backend-access)
- [AWS OIDC Integration](https://vercel.com/docs/integrations/aws-oidc)
- [Token Validation Libraries](https://github.com/vercel/oidc-helpers)

## Security Best Practices

1. Always validate OIDC tokens on your backend
2. Check token claims match expected values
3. Implement short TTLs for exchanged credentials
4. Log all credential exchanges for auditing
5. Use separate credentials per environment

This approach provides enterprise-grade security while maintaining the simplicity of the development experience.