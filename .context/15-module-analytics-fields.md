# Module 5 & 6: Analytics and Fields

## 📦 Module 5: Statistics & Analytics

### 5.1 Team Stats Overview

- **URL**: `/teams/[slug]/stats`
- **AC**: Time range selector. Summary Cards (Wins, Goals, Clean Sheets). Win Rate Chart. Form Chart (W/L/D). Top Performers. Export PDF.
- **Endpoint**: `GET /api/teams/[slug]/stats`

### 5.2 Player Comparison

- **URL**: `/teams/[slug]/stats/compare`
- **AC**: Radar Chart (Goals, Assists, Points). Select 2-4 players.

### 5.3 Head-to-Head

- **URL**: `/teams/[slug]/stats/opponents`
- **AC**: List opponents. W/L/D record. Goals Scored/Conceded.

---

## 📦 Module 6: Field Booking

### 6.1 Field Directory

- **URL**: `/teams/[slug]/fields`
- **AC**: List available fields. Filter (Type, Surface, Price). Map View. Distance calculation.
- **Database**: `fields` (id, name, location, type, price, contact).

### 6.2 Field Detail

- **URL**: `/teams/[slug]/fields/[id]`
- **AC**: Gallery. Info (Facilities, Dimensions). Availability Calendar. "Book Now". Reviews.

### 6.3 Book Field

- **URL**: `/teams/[slug]/fields/[id]/book`
- **AC**: Select Date/Time. Duration (1-3h). Price Calc. Payment (Field/Online).
- **Database**: `bookings` (id, team_id, field_id, match_id, status, payment...).

### 6.4 Booking History

- **URL**: `/teams/[slug]/bookings`
- **AC**: Filter (Upcoming, Past). Actions (Cancel/Rebook).
