// Realistik mock data — barcha sahifalar shu yerdan oladi
export type Role = "admin" | "seller" | "user";
export type OrderStatus = "pending" | "processing" | "shipping" | "delivered" | "cancelled";
export type ProductStatus = "approved" | "pending" | "rejected";
export type CategoryStatus = "active" | "pending";

export interface Person {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  joinedAt: string;
  spent?: number;     // user
  revenue?: number;   // seller
  orders?: number;    // user
  products?: number;  // seller
  blocked?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productsCount: number;
  status: CategoryStatus;
  requestedBy?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  seller: string;
  price: number;
  stock: number;
  sold: number;
  status: ProductStatus;
  image: string;
}

export interface Order {
  id: string;
  customer: string;
  seller: string;
  product: string;
  qty: number;
  total: number;
  payment: "card" | "cash" | "wallet";
  status: OrderStatus;
  date: string;
}

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=FF6633,FCD5BA,70C05B,1CB9FC,FCA21C&fontWeight=600`;

const productImg = (seed: string) =>
  `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=FCD5BA,F3F2F1,E5FFDE,FFC7C7`;

export const people: Person[] = [
  { id: "u1", name: "Aziz Karimov", email: "aziz@mail.uz", avatar: avatar("Aziz K"), role: "admin", joinedAt: "2024-01-12", blocked: false },
  { id: "u2", name: "Malika Yusupova", email: "malika@shop.uz", avatar: avatar("Malika Y"), role: "seller", revenue: 48_320_000, products: 42, joinedAt: "2024-03-04" },
  { id: "u3", name: "Bobur Olimov", email: "bobur@mail.com", avatar: avatar("Bobur O"), role: "user", spent: 3_250_000, orders: 17, joinedAt: "2024-05-22" },
  { id: "u4", name: "Dilnoza Rahimova", email: "dilnoza@biz.uz", avatar: avatar("Dilnoza R"), role: "seller", revenue: 92_140_000, products: 88, joinedAt: "2023-11-08" },
  { id: "u5", name: "Sardor Tursunov", email: "sardor@gmail.com", avatar: avatar("Sardor T"), role: "user", spent: 1_120_000, orders: 8, joinedAt: "2024-08-19" },
  { id: "u6", name: "Nilufar Hakimova", email: "nilufar@store.uz", avatar: avatar("Nilufar H"), role: "seller", revenue: 27_900_000, products: 31, joinedAt: "2024-02-14" },
  { id: "u7", name: "Jasur Mirzaev", email: "jasur@mail.ru", avatar: avatar("Jasur M"), role: "user", spent: 5_780_000, orders: 24, joinedAt: "2023-12-30" },
  { id: "u8", name: "Kamola Saidova", email: "kamola@market.uz", avatar: avatar("Kamola S"), role: "seller", revenue: 15_400_000, products: 19, joinedAt: "2024-06-11" },
  { id: "u9", name: "Otabek Yo'ldoshev", email: "otabek@mail.uz", avatar: avatar("Otabek Y"), role: "user", spent: 890_000, orders: 4, joinedAt: "2024-09-02", blocked: true },
  { id: "u10", name: "Shoira Komilova", email: "shoira@trade.uz", avatar: avatar("Shoira K"), role: "seller", revenue: 64_220_000, products: 56, joinedAt: "2024-01-28" },
  { id: "u11", name: "Rustam Qodirov", email: "rustam@mail.com", avatar: avatar("Rustam Q"), role: "user", spent: 2_410_000, orders: 11, joinedAt: "2024-07-15" },
  { id: "u12", name: "Zarina Ergasheva", email: "zarina@admin.uz", avatar: avatar("Zarina E"), role: "admin", joinedAt: "2023-09-01" },
];

export const categories: Category[] = [
  { id: "c1", name: "Elektronika", slug: "electronics", productsCount: 248, status: "active", createdAt: "2024-01-10" },
  { id: "c2", name: "Kiyim-kechak", slug: "fashion", productsCount: 412, status: "active", createdAt: "2024-01-10" },
  { id: "c3", name: "Uy-ro'zg'or", slug: "home", productsCount: 187, status: "active", createdAt: "2024-02-04" },
  { id: "c4", name: "Sport va Fitness", slug: "sport", productsCount: 96, status: "active", createdAt: "2024-03-19" },
  { id: "c5", name: "Go'zallik", slug: "beauty", productsCount: 154, status: "active", createdAt: "2024-04-22" },
  { id: "c6", name: "Bolalar olami", slug: "kids", productsCount: 78, status: "active", createdAt: "2024-05-30" },
  { id: "c7", name: "Avto aksessuarlar", slug: "auto", productsCount: 0, status: "pending", requestedBy: "Malika Yusupova", createdAt: "2026-04-15" },
  { id: "c8", name: "Hayvonlar uchun", slug: "pets", productsCount: 0, status: "pending", requestedBy: "Nilufar Hakimova", createdAt: "2026-04-17" },
];

const titles = [
  "iPhone 15 Pro 256GB", "Samsung QLED 55\"", "Nike Air Max 270", "Adidas Ultraboost",
  "MacBook Air M3", "Dyson V12 Vacuum", "Sony WH-1000XM5", "Levi's 501 Jeans",
  "Xiaomi Mi Band 8", "LG Refrigerator", "Zara Wool Coat", "Lego Star Wars",
  "Philips Air Fryer", "Canon EOS R6", "Asus ROG Laptop", "Bose SoundLink",
];
export const products: Product[] = titles.map((t, i) => ({
  id: `p${i + 1}`,
  title: t,
  category: categories[i % 6].name,
  seller: people.filter(p => p.role === "seller")[i % 5].name,
  price: [1_290_000, 8_400_000, 1_750_000, 2_300_000, 14_200_000, 5_900_000, 3_400_000, 980_000][i % 8],
  stock: [42, 8, 156, 0, 23, 91, 4, 67][i % 8],
  sold: [128, 412, 89, 256, 33, 178, 92, 304][i % 8],
  status: (["approved", "approved", "pending", "approved", "approved", "pending", "approved", "rejected"] as ProductStatus[])[i % 8],
  image: productImg(t),
}));

const orderStatuses: OrderStatus[] = ["pending", "processing", "shipping", "delivered", "cancelled"];
export const orders: Order[] = Array.from({ length: 24 }, (_, i) => {
  const p = products[i % products.length];
  const c = people.filter(x => x.role === "user")[i % 5];
  return {
    id: `ORD-${10234 + i}`,
    customer: c.name,
    seller: p.seller,
    product: p.title,
    qty: (i % 3) + 1,
    total: p.price * ((i % 3) + 1),
    payment: (["card", "cash", "wallet"] as const)[i % 3],
    status: orderStatuses[i % 5],
    date: `2026-04-${String((i % 19) + 1).padStart(2, "0")}`,
  };
});

// Charts data
export const revenueByMonth = [
  { month: "May", revenue: 142, orders: 320 },
  { month: "Iyun", revenue: 168, orders: 384 },
  { month: "Iyul", revenue: 195, orders: 421 },
  { month: "Avg", revenue: 178, orders: 398 },
  { month: "Sen", revenue: 224, orders: 487 },
  { month: "Okt", revenue: 256, orders: 542 },
  { month: "Noy", revenue: 289, orders: 612 },
  { month: "Dek", revenue: 342, orders: 731 },
  { month: "Yan", revenue: 318, orders: 689 },
  { month: "Fev", revenue: 285, orders: 624 },
  { month: "Mar", revenue: 367, orders: 798 },
  { month: "Apr", revenue: 412, orders: 892 },
];

export const categoryShare = categories
  .filter(c => c.status === "active")
  .map(c => ({ name: c.name, value: c.productsCount }));

export const recentActivity = [
  { id: "a1", type: "product_sold", text: "Malika Yusupova \u2014 \"iPhone 15 Pro\" 2 dona sotildi", time: "2 daqiqa oldin", tone: "success" as const },
  { id: "a2", type: "category_request", text: "Nilufar Hakimova yangi \"Hayvonlar uchun\" kategoriyasini so'radi", time: "18 daqiqa oldin", tone: "info" as const },
  { id: "a3", type: "product_sold", text: "Dilnoza Rahimova \u2014 \"MacBook Air M3\" sotildi", time: "42 daqiqa oldin", tone: "success" as const },
  { id: "a4", type: "user_blocked", text: "Otabek Yo'ldoshev qoidabuzarlik uchun bloklandi", time: "1 soat oldin", tone: "destructive" as const },
  { id: "a5", type: "category_request", text: "Malika Yusupova \"Avto aksessuarlar\" kategoriyasini so'radi", time: "3 soat oldin", tone: "info" as const },
  { id: "a6", type: "product_sold", text: "Shoira Komilova \u2014 \"Sony WH-1000XM5\" 4 dona sotildi", time: "5 soat oldin", tone: "success" as const },
];

export const fmt = {
  som: (n: number) => new Intl.NumberFormat("uz-UZ").format(n) + " so'm",
  short: (n: number) => {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + " mlrd";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + " mln";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
    return String(n);
  },
};
