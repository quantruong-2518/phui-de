# Module 7 & 8: Services (Food & Shop)

## 📦 Module 7: Food Ordering

### 7.1 Restaurant List

- **URL**: `/teams/[slug]/food`
- **AC**: List near fields. Filter Cuisine/Price/Rating. Integration (Grab, ShopeeFood).
- **Database**: `restaurants` (id, name, cuisine, delivery_radius...).

### 7.2 Group Order

- **URL**: `/teams/[slug]/food/order/[matchId]`
- **AC**: Link to Match. Menu Display. Split Payment (Equal/Per Person).
- **Database**: `food_orders`, `food_order_items`.

---

## 📦 Module 8: Equipment Shopping

### 8.1 Product Catalog

- **URL**: `/teams/[slug]/shop`
- **AC**: Grid View. Categories (Balls, Jerseys, Shoes). Filter (Brand, Price). "Quick Add".
- **Database**: `products` (id, name, category, price, stock, external_url).

### 8.2 Shopping Cart

- **URL**: `/teams/[slug]/shop/cart`
- **AC**: Adjust Qty. Delivery Options (Home/Field). Checkout.

### 8.3 Order Tracking

- **URL**: `/teams/[slug]/shop/orders`
- **AC**: List Orders. Status (Processing, Shipped). Detail View.
