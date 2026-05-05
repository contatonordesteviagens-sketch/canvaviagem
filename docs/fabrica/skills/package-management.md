# Skill: Package Management (CRUD)

## Overview
Phase 2 of the Fábrica allows for dynamic management of travel packages. These packages are used to populate the Landing Page and generate specific Offer Ads.

## CRUD Operations
- **Create**: Add custom packages via the "Adicionar Pacote" button.
- **Read**: View 8-10 pre-configured packages per niche.
- **Update**: Edit title, price, description, and images in real-time.
- **Delete**: Remove irrelevant packages to keep the landing page focused.
- **Duplicate**: Cloners existing packages to quickly create variations.

## Data Persistence
Current package state is managed via `useFabricaContext` and persisted in `localStorage`. 

### Future Enhancement
If long-term persistence is needed across multiple devices, implement a Supabase Table `fabrica_user_packages` and sync the context state with the DB.

## Integration
Selected packages are automatically injected into:
1. **Phase 3**: For "Oferta de Pacote" ad generation.
2. **Phase 4**: As editable blocks in the Landing Page Builder.
