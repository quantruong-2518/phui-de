# User Journey & Flow

## 🗺️ User Journey Map

```mermaid
graph TD
    Start((Start)) --> Landing[1. Landing Page]
    Landing --> Auth[2. Login / Register]
    Auth --> TeamSelect[3. Team Selection]
    TeamSelect --> Dashboard[4. Team Dashboard]

    Dashboard --> Players[5. Player Management]
    Dashboard --> Matches[6. Match Management]
    Dashboard --> Stats[7. Statistics & Analytics]
    Dashboard --> Fields[8. Field Booking]
    Dashboard --> Food[9. Food Ordering]
    Dashboard --> Shop[10. Equipment Shopping]
```

## 🛤️ Detailed Journeys

### Journey 1: First Time User

1. **Visit**: User visits `phuide.com` -> Sees Landing Page.
2. **Action**: Clicks "Start Now" -> Register Form.
3. **Auth**: Registers (Email/Google) -> Verifies Email.
4. **Onboarding**: Redirected to `/teams` (Empty State) -> Clicks "Create New Team".
5. **Setup**: Fills team info (Name, Logo, Colors).
6. **Success**: Team created -> Directed to Team Dashboard.
7. **Guide**: Views onboarding tour tooltips.

### Journey 2: Returning User (Manager)

1. **Login**: Logs in at `/login`.
2. **Selection**: Sees list of managed teams at `/teams`.
3. **Access**: Clicks "Passion FC" card -> Enters `/teams/passion/dashboard`.
4. **Overview**: Checks quick stats (Players, Matches, Win Rate).
5. **Action**:
   - Manage Roster (Players)
   - Record Match Result (Matches)
   - View Analytics (Stats)
   - Book Field for next game (Fields)
   - Order Food (Services)
