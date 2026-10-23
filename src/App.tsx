import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useAuth,
  useLazyQuery,
  useMutation,
  useQuery,
} from "@animaapp/playground-react-sdk";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  Heart,
  ImageUp,
  LockKeyhole,
  Menu,
  Minus,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import gsap from "gsap";

type PdpGuideStep = {
  title: string;
  copy: string;
};

type PdpGuideContent = {
  eyebrow: string;
  title: string;
  copy: string;
  steps: PdpGuideStep[];
};

type PdpSupportContent = {
  selectionLabel: string;
  howToUse: string;
  fullDetails: string;
  guide: PdpGuideContent;
};

type HomePrinciple = {
  icon: "sparkles" | "shield" | "truck";
  title: string;
  copy: string;
};

type HomePromoModule = {
  id: string;
  eyebrow: string;
  title: string;
  copy: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
};

type HomeCollectionsContent = {
  eyebrow: string;
  title: string;
  copy: string;
  featuredSlugs: string[];
};

type HomeContent = {
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    copy: string;
    ctaLabel: string;
    image: string;
    note: string;
  };
  shop: {
    eyebrow: string;
    title: string;
    copy: string;
  };
  story: {
    eyebrow: string;
    title: string;
    copy: string;
    ctaLabel: string;
    image: string;
  };
  newsletter: {
    eyebrow: string;
    title: string;
    copy: string;
    buttonLabel: string;
    placeholder: string;
  };
  principles: HomePrinciple[];
  promos: HomePromoModule[];
  collections: HomeCollectionsContent;
};

type CollectionView = {
  id: string;
  title: string;
  slug: string;
  description: string;
};

type ProductRoutineProfile = {
  routineStep: string;
  skinConcern: string;
  finish: string;
  inspiredByCopy: string;
  sourceTransparencyNote: string;
};

type ProductView = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  shades: string[];
  benefits: string[];
  status: string;
  version: number;
  collectionSlugs: string[];
  pdpSupport: PdpSupportContent;
  routineProfile: ProductRoutineProfile;
};

type CartItem = {
  product: ProductView;
  quantity: number;
  shade: string;
};

type WishlistItem = {
  productId: string;
  addedAt: string;
};

type SavedCartSnapshot = {
  id: string;
  createdAt: string;
  items: CartItem[];
};

type CheckoutFormValues = {
  customerName: string;
  customerEmail: string;
  shippingLine1: string;
  shippingLine2: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  billingSameAsShipping: boolean;
  billingLine1: string;
  billingLine2: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvc: string;
};

type CheckoutResolvedLine = {
  cartItem: CartItem;
  variant: any;
  inventoryRows: any[];
  requestedQuantity: number;
  unitPrice: number;
  lineTotal: number;
};

type ProductContentMap = Record<
  string,
  {
    shades: string[];
    benefits: string[];
    version: number;
    collectionSlugs: string[];
    howToUse?: string;
    fullDetails?: string;
    selectionLabel?: string;
    guide?: Partial<PdpGuideContent>;
    routineStep?: string;
    skinConcern?: string;
    finish?: string;
    inspiredByCopy?: string;
    sourceTransparencyNote?: string;
  }
>;

type DataStateProps = {
  isPending: boolean;
  error: Error | null;
  onRetry?: () => void;
  loadingLabel?: string;
  errorLabel?: string;
};

type RoutineAnswers = {
  concern: string;
  cadence: string;
  focus: string;
};

type ShopTheLookHotspot = {
  id: string;
  label: string;
  top: string;
  left: string;
  area: "face" | "lips" | "hair" | "eyes";
};

type KBeautyAssortmentBlueprint = {
  slug: string;
  name: string;
  category: string;
  routineStep: string;
  skinConcern: string;
  finish: string;
  inspiredByCopy: string;
  variantExamples: string[];
  seedQuantity: number;
};

type CmsTab =
  | "products"
  | "variants"
  | "inventory"
  | "collections"
  | "editorial";

function parseJsonStringArray(value: string | undefined, fallback: string[]) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "string")
    ) {
      return parsed;
    }
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function normalizeShadeName(shadeName?: string) {
  if (!shadeName || !shadeName.trim()) return null;
  return shadeName.trim();
}

function currency(value: number) {
  return `$${value.toFixed(2)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseEditorialPayload(content: string | undefined) {
  if (!content) return {};
  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return { copy: content };
  }
}

function parseGuideSteps(value: unknown): PdpGuideStep[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const title =
        typeof (item as Record<string, unknown>).title === "string"
          ? (item as Record<string, string>).title.trim()
          : "";
      const copy =
        typeof (item as Record<string, unknown>).copy === "string"
          ? (item as Record<string, string>).copy.trim()
          : "";
      if (!title || !copy) return null;
      return { title, copy };
    })
    .filter((item): item is PdpGuideStep => Boolean(item));
}

function parseProductGuide(
  value: unknown,
  fallbackGuide: PdpGuideContent,
): PdpGuideContent {
  if (!value || typeof value !== "object") return fallbackGuide;
  const payload = value as Record<string, unknown>;
  const steps = parseGuideSteps(payload.steps);
  return {
    eyebrow:
      typeof payload.eyebrow === "string" && payload.eyebrow.trim()
        ? payload.eyebrow.trim()
        : fallbackGuide.eyebrow,
    title:
      typeof payload.title === "string" && payload.title.trim()
        ? payload.title.trim()
        : fallbackGuide.title,
    copy:
      typeof payload.copy === "string" && payload.copy.trim()
        ? payload.copy.trim()
        : fallbackGuide.copy,
    steps: steps.length ? steps : fallbackGuide.steps,
  };
}

function parsePromos(value: unknown): HomePromoModule[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const payload = item as Record<string, unknown>;
      const title =
        typeof payload.title === "string" ? payload.title.trim() : "";
      if (!title) return null;
      return {
        id:
          typeof payload.id === "string" && payload.id.trim()
            ? payload.id.trim()
            : `promo-${index}`,
        eyebrow:
          typeof payload.eyebrow === "string" ? payload.eyebrow.trim() : "",
        title,
        copy: typeof payload.copy === "string" ? payload.copy.trim() : "",
        ctaLabel:
          typeof payload.ctaLabel === "string" && payload.ctaLabel.trim()
            ? payload.ctaLabel.trim()
            : "Learn more",
        ctaHref:
          typeof payload.ctaHref === "string" && payload.ctaHref.trim()
            ? payload.ctaHref.trim()
            : "#shop",
        image: typeof payload.image === "string" ? payload.image.trim() : "",
      };
    })
    .filter((item): item is HomePromoModule => Boolean(item));
}

function parsePrinciples(value: unknown): HomePrinciple[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const payload = item as Record<string, unknown>;
      const title =
        typeof payload.title === "string" ? payload.title.trim() : "";
      const copy = typeof payload.copy === "string" ? payload.copy.trim() : "";
      const iconRaw =
        typeof payload.icon === "string"
          ? payload.icon.toLowerCase().trim()
          : "sparkles";
      const icon: HomePrinciple["icon"] =
        iconRaw === "shield"
          ? "shield"
          : iconRaw === "truck"
            ? "truck"
            : "sparkles";
      if (!title || !copy) return null;
      return { icon, title, copy };
    })
    .filter((item): item is HomePrinciple => Boolean(item));
}

function withDefaultString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function inferRoutineStep(category: string, name: string) {
  const value = `${category} ${name}`.toLowerCase();
  if (value.includes("cleanser")) return "Step 1 · Cleanser";
  if (value.includes("essence")) return "Step 2 · Essence";
  if (value.includes("serum")) return "Step 3 · Serum";
  if (value.includes("moisturizer") || value.includes("cream")) {
    return "Step 4 · Moisturizer";
  }
  if (value.includes("spf") || value.includes("sunscreen")) {
    return "Step 5 · SPF";
  }
  if (value.includes("lip")) return "Step 6 · Lip tint";
  if (value.includes("cushion")) return "Step 7 · Cushion";
  return "Routine support";
}

function inferSkinConcern(category: string, description: string) {
  const value = `${category} ${description}`.toLowerCase();
  if (
    value.includes("barrier") ||
    value.includes("dry") ||
    value.includes("hydrate")
  ) {
    return "Dehydration and barrier";
  }
  if (
    value.includes("blemish") ||
    value.includes("acne") ||
    value.includes("clarity")
  ) {
    return "Clarity and texture";
  }
  if (
    value.includes("redness") ||
    value.includes("sensitive") ||
    value.includes("calm")
  ) {
    return "Sensitivity and redness";
  }
  if (
    value.includes("dull") ||
    value.includes("glow") ||
    value.includes("bright")
  ) {
    return "Tone and glow";
  }
  return "Daily skin balance";
}

function inferFinish(name: string, description: string) {
  const value = `${name} ${description}`.toLowerCase();
  if (value.includes("matte") || value.includes("blur")) return "Soft matte";
  if (value.includes("glow") || value.includes("dewy")) return "Dewy";
  if (value.includes("satin")) return "Satin";
  return "Natural skin-like";
}

function inferInspiredByCopy(name: string, category: string) {
  const value = `${name} ${category}`.toLowerCase();
  if (
    value.includes("korean") ||
    value.includes("k-beauty") ||
    value.includes("kbeauty")
  ) {
    return "Inspired by routines popular in K-pop beauty trends with gentle layering and camera-ready skin prep.";
  }
  return "Inspired by routines popular in K-pop beauty trends with skin-first layering techniques.";
}

function inferSourceTransparencyNote(name: string) {
  return `Editorial sourcing note: ${name} references public K-beauty trend reporting and routine education, not celebrity endorsement or official affiliation.`;
}

function normalizeInspiredByCopy(value: string, fallback: string) {
  const baseline = "Inspired by routines popular in K-pop beauty trends";
  const cleaned = value
    .replace(/endorsed by[^.]*\.?/gi, "")
    .replace(/used by[^.]*\.?/gi, "")
    .replace(/official[^.]*\.?/gi, "")
    .trim();

  if (!cleaned) return fallback;

  const hasBaseline = cleaned.toLowerCase().includes(baseline.toLowerCase());
  if (hasBaseline) return cleaned;

  return `${baseline}. ${cleaned}`;
}

function generateOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const nonce = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `BLM-${stamp}-${nonce}`;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseCardDigits(cardNumber: string) {
  return cardNumber.replace(/\s+/g, "");
}

async function processPayment({
  provider,
  cardNumber,
  amount,
  currencyCode,
}: {
  provider: string;
  cardNumber: string;
  amount: number;
  currencyCode: string;
}) {
  await sleep(900);
  const digits = parseCardDigits(cardNumber);
  if (digits.length < 12) {
    throw new Error(
      "Card details are incomplete. Please verify and try again.",
    );
  }
  if (digits.endsWith("0000")) {
    throw new Error(
      "Payment was declined by the card issuer. Please retry with a different card.",
    );
  }
  return `${provider}-${currencyCode}-${Math.round(amount * 100)}-${Date.now()}`;
}

function Header({
  cartCount,
  onCart,
}: {
  cartCount: number;
  onCart: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isPending, isAnonymous, login, logout } = useAuth();

  const authLabel = isPending
    ? "..."
    : isAnonymous
      ? "Sign in"
      : user?.name || "Account";

  return (
    <>
      <div className="offer-bar">
        Free shipping over $50 <span /> Complimentary samples with every order
      </div>
      <header className="site-header">
        <Link to="/" className="wordmark" aria-label="Bloom Balance home">
          BLOOM<span>$</span>BALANCE
        </Link>
        <nav className={mobileOpen ? "main-nav is-open" : "main-nav"}>
          <Link to="/#shop" onClick={() => setMobileOpen(false)}>
            New
          </Link>
          <Link to="/#shop" onClick={() => setMobileOpen(false)}>
            Skincare
          </Link>
          <Link to="/#shop" onClick={() => setMobileOpen(false)}>
            Makeup
          </Link>
          <Link to="/#shop" onClick={() => setMobileOpen(false)}>
            Body
          </Link>
          <Link to="/#story" onClick={() => setMobileOpen(false)}>
            Our Philosophy
          </Link>
          <Link to="/account" onClick={() => setMobileOpen(false)}>
            Account
          </Link>
          <Link to="/cms" onClick={() => setMobileOpen(false)}>
            CMS
          </Link>
        </nav>
        <div className="header-actions">
          <button
            className="header-icon-button search-button"
            aria-label="Search"
          >
            <Search size={18} strokeWidth={2.2} />
          </button>
          <button
            className="header-icon-button profile-button"
            aria-label={isAnonymous ? "Sign in" : "Sign out"}
            onClick={isAnonymous ? () => void login() : () => void logout()}
          >
            <UserRound size={18} strokeWidth={2.2} />
            <span className="sr-only">{authLabel}</span>
          </button>
          <button
            className="header-icon-button bag-button"
            onClick={onCart}
            aria-label={`Shopping bag with ${cartCount} items`}
          >
            <ShoppingBag size={18} strokeWidth={2.2} />
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
          <button
            className="menu-button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>
    </>
  );
}

function ProductCard({
  product,
  onQuickAdd,
  isWishlisted,
  onToggleWishlist,
}: {
  product: ProductView;
  onQuickAdd: (product: ProductView) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: ProductView) => void;
}) {
  return (
    <article className="product-card">
      <Link to={`/product/${product.slug}`} className="product-image-wrap">
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
        />
        <button
          type="button"
          className={isWishlisted ? "wish-button active" : "wish-button"}
          aria-pressed={isWishlisted}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name}`
          }
          onClick={(event) => {
            event.preventDefault();
            onToggleWishlist(product);
          }}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </Link>
      <div className="product-card-info">
        <p className="eyebrow">{product.category}</p>
        <Link to={`/product/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="rating">
          <Star size={13} fill="currentColor" /> {product.rating}{" "}
          <span>({product.reviews})</span>
        </div>
        <div className="product-card-bottom">
          <strong>{currency(product.price)}</strong>
          <button onClick={() => onQuickAdd(product)}>Quick add</button>
        </div>
      </div>
    </article>
  );
}

function LoadingOrErrorState({
  isPending,
  error,
  onRetry,
  loadingLabel = "Loading catalog...",
  errorLabel = "Catalog unavailable",
}: DataStateProps) {
  if (isPending) {
    return (
      <main className="not-found" id="main-content">
        <div role="status" aria-live="polite">
          <h1>{loadingLabel}</h1>
        </div>
      </main>
    );
  }
  if (error) {
    return (
      <main className="not-found" id="main-content">
        <div role="alert" aria-live="assertive">
          <h1>{errorLabel}</h1>
          <p>{error.message}</p>
          {onRetry ? (
            <button className="primary-button" type="button" onClick={onRetry}>
              Retry
            </button>
          ) : null}
        </div>
      </main>
    );
  }
  return null;
}

function CatalogSkeleton() {
  return (
    <main
      className="shop-section catalog-skeleton"
      id="main-content"
      aria-busy="true"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Loading products</p>
          <h2>Preparing your essentials</h2>
        </div>
      </div>
      <div className="product-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <article className="skeleton-card" key={`skeleton-card-${index}`}>
            <div className="skeleton-image" />
            <div className="skeleton-line short" />
            <div className="skeleton-line" />
            <div className="skeleton-line medium" />
          </article>
        ))}
      </div>
    </main>
  );
}

function ProductPageSkeleton() {
  return (
    <main className="product-page" id="main-content" aria-busy="true">
      <div className="product-detail product-skeleton">
        <div className="skeleton-image detail" />
        <div>
          <div className="skeleton-line short" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line short" />
        </div>
      </div>
    </main>
  );
}

function AccountSkeleton() {
  return (
    <main className="account-page" id="main-content" aria-busy="true">
      <div className="account-shell account-skeleton">
        <div className="skeleton-line medium" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
      </div>
    </main>
  );
}

function Home({
  products,
  onAdd,
  isPending,
  error,
  homeContent,
  collections,
  wishlistProductIds,
  onToggleWishlist,
}: {
  products: ProductView[];
  onAdd: (product: ProductView, shade?: string, quantity?: number) => void;
  isPending: boolean;
  error: Error | null;
  homeContent: HomeContent;
  collections: CollectionView[];
  wishlistProductIds: Set<string>;
  onToggleWishlist: (product: ProductView) => void;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [detailsProduct, setDetailsProduct] = useState<ProductView | null>(
    null,
  );
  const [routineOpen, setRoutineOpen] = useState(false);

  const selectedCollectionSlug = searchParams.get("collection") || "";
  const shopTheLookItems = useMemo(
    () => buildShopTheLookItems(products),
    [products],
  );
  const [activeLookProductId, setActiveLookProductId] = useState("");

  useEffect(() => {
    if (!shopTheLookItems.length) {
      setActiveLookProductId("");
      return;
    }
    setActiveLookProductId((current) =>
      current && shopTheLookItems.some((item) => item.product.id === current)
        ? current
        : shopTheLookItems[0].product.id,
    );
  }, [shopTheLookItems]);

  useEffect(() => {
    if (!heroRef.current) return;
    gsap.fromTo(
      heroRef.current.querySelectorAll("[data-reveal]"),
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power2.out" },
    );
  }, []);

  const categories = useMemo(() => {
    const fromProducts = Array.from(
      new Set(products.map((item) => item.category)),
    );
    return ["All", ...fromProducts];
  }, [products]);

  const featuredCollections = useMemo(() => {
    const explicit = homeContent.collections.featuredSlugs
      .map((slug) => collections.find((collection) => collection.slug === slug))
      .filter((item): item is CollectionView => Boolean(item));
    if (explicit.length) return explicit;
    return collections.slice(0, 3);
  }, [collections, homeContent.collections.featuredSlugs]);

  const filtered = useMemo(() => {
    const collectionFiltered = selectedCollectionSlug
      ? products.filter((product) =>
          product.collectionSlugs.includes(selectedCollectionSlug),
        )
      : [...products];

    const categoryFiltered =
      category === "All"
        ? collectionFiltered
        : collectionFiltered.filter((product) => product.category === category);

    if (sort === "low") categoryFiltered.sort((a, b) => a.price - b.price);
    if (sort === "high") categoryFiltered.sort((a, b) => b.price - a.price);
    if (sort === "rating") categoryFiltered.sort((a, b) => b.rating - a.rating);
    return categoryFiltered;
  }, [category, selectedCollectionSlug, sort, products]);

  if (isPending) {
    return <CatalogSkeleton />;
  }

  if (error) {
    return (
      <LoadingOrErrorState
        isPending={false}
        error={error}
        errorLabel="Catalog unavailable"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <main id="main-content">
      <section className="hero" ref={heroRef}>
        {homeContent.hero.image ? (
          <div className="hero-visual">
            <img
              src={homeContent.hero.image}
              alt={homeContent.hero.title}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        ) : (
          <div className="hero-visual hero-visual-empty" />
        )}
        <div className="hero-copy">
          <p className="eyebrow" data-reveal>
            {homeContent.hero.eyebrow}
          </p>
          <h1 data-reveal>
            {homeContent.hero.title}
            <br />
            <em>{homeContent.hero.titleAccent}</em>
          </h1>
          <p data-reveal>{homeContent.hero.copy}</p>
          <a href="#shop" className="primary-button" data-reveal>
            {homeContent.hero.ctaLabel}
          </a>
        </div>
        <div className="hero-note">{homeContent.hero.note}</div>
      </section>

      {homeContent.principles.length ? (
        <section className="principles">
          {homeContent.principles.map((item) => (
            <div key={`${item.icon}-${item.title}`}>
              {item.icon === "shield" ? (
                <ShieldCheck size={22} />
              ) : item.icon === "truck" ? (
                <Truck size={22} />
              ) : (
                <Sparkles size={22} />
              )}
              <span>
                <strong>{item.title}</strong>
                {item.copy}
              </span>
            </div>
          ))}
        </section>
      ) : null}

      {featuredCollections.length ? (
        <section className="collection-slots">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{homeContent.collections.eyebrow}</p>
              <h2>{homeContent.collections.title}</h2>
            </div>
            <p>{homeContent.collections.copy}</p>
          </div>
          <div className="collection-slot-grid">
            {featuredCollections.map((collection) => (
              <article key={collection.id} className="collection-slot-card">
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
                <Link to={`/?collection=${collection.slug}#shop`}>
                  Shop collection
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {homeContent.promos.length ? (
        <section className="promo-section">
          <div className="promo-grid">
            {homeContent.promos.map((promo) => (
              <article key={promo.id} className="promo-card">
                {promo.image ? (
                  <img src={promo.image} alt={promo.title} />
                ) : null}
                <div>
                  <p className="eyebrow">{promo.eyebrow}</p>
                  <h3>{promo.title}</h3>
                  <p>{promo.copy}</p>
                  <a href={promo.ctaHref}>{promo.ctaLabel}</a>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {shopTheLookItems.length ? (
        <section className="shop-look-section" id="shop-look">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Shop the look</p>
              <h2>Tap the hotspots to add the exact products</h2>
            </div>
            <p>
              Explore a shoppable beauty look with clickable face and hair
              points inspired by lifestyle and creator content.
            </p>
          </div>
          <div className="shop-look-layout">
            <div className="shop-look-visual">
              <img
                src={
                  homeContent.story.image ||
                  homeContent.hero.image ||
                  shopTheLookItems[0].product.image
                }
                alt="Shop the look lifestyle visual"
                loading="lazy"
                decoding="async"
              />
              {shopTheLookItems.map((item) => (
                <button
                  key={`hotspot-${item.product.id}`}
                  type="button"
                  className={
                    activeLookProductId === item.product.id
                      ? "look-hotspot active"
                      : "look-hotspot"
                  }
                  style={{ top: item.hotspot.top, left: item.hotspot.left }}
                  aria-label={`Add ${item.product.name} from ${item.hotspot.label} hotspot`}
                  onClick={() => {
                    setActiveLookProductId(item.product.id);
                    onAdd(item.product, item.shade, 1);
                  }}
                >
                  <span>{item.hotspot.label}</span>
                </button>
              ))}
            </div>
            <div className="shop-look-grid">
              {shopTheLookItems.map((item) => (
                <article
                  key={`look-item-${item.product.id}`}
                  className={
                    activeLookProductId === item.product.id
                      ? "shop-look-card active"
                      : "shop-look-card"
                  }
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <p className="eyebrow">{item.hotspot.label} hotspot</p>
                    <h3>{item.product.name}</h3>
                    <p>{currency(item.product.price)}</p>
                    <button
                      type="button"
                      className="checkout-link"
                      onClick={() => {
                        setActiveLookProductId(item.product.id);
                        onAdd(item.product, item.shade, 1);
                      }}
                    >
                      Add to bag
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="shop-section" id="shop">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{homeContent.shop.eyebrow}</p>
            <h2>{homeContent.shop.title}</h2>
          </div>
          <div className="shop-copy-actions">
            <p>{homeContent.shop.copy}</p>
            <button
              type="button"
              className="routine-builder-button"
              onClick={() => setRoutineOpen(true)}
            >
              <Sparkles size={16} />
              Find your skincare routine
            </button>
          </div>
        </div>
        <div className="filter-row">
          <div
            className="category-filters"
            aria-label="Filter products by category"
          >
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="catalog-tools">
            {selectedCollectionSlug ? (
              <button
                className="checkout-link"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete("collection");
                  setSearchParams(next);
                }}
              >
                Clear collection filter
              </button>
            ) : null}
            <label className="sort-select">
              <span>Sort by</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="rating">Top rated</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
              <ChevronDown size={16} />
            </label>
          </div>
        </div>
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickAdd={setDetailsProduct}
              isWishlisted={wishlistProductIds.has(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </section>

      <section className="story-section" id="story">
        {homeContent.story.image ? (
          <div className="story-image">
            <img
              src={homeContent.story.image}
              alt={homeContent.story.title}
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : (
          <div className="story-image story-image-empty" />
        )}
        <div className="story-copy">
          <p className="eyebrow">{homeContent.story.eyebrow}</p>
          <h2>{homeContent.story.title}</h2>
          <p>{homeContent.story.copy}</p>
          <a href="#shop">
            {homeContent.story.ctaLabel}{" "}
            <ArrowLeft className="arrow-right" size={16} />
          </a>
        </div>
      </section>

      <section className="newsletter">
        <p className="eyebrow">{homeContent.newsletter.eyebrow}</p>
        <h2>{homeContent.newsletter.title}</h2>
        <p>{homeContent.newsletter.copy}</p>
        <form onSubmit={(event) => event.preventDefault()}>
          <input
            type="email"
            aria-label="Email address"
            placeholder={homeContent.newsletter.placeholder}
            required
          />
          <button type="submit">{homeContent.newsletter.buttonLabel}</button>
        </form>
      </section>

      {routineOpen ? (
        <RoutineBuilderModal
          products={products}
          onAdd={onAdd}
          onClose={() => setRoutineOpen(false)}
        />
      ) : null}

      {detailsProduct && (
        <div
          className="modal-shell"
          role="dialog"
          aria-modal="true"
          aria-label="Quick product details"
        >
          <button
            className="modal-backdrop"
            onClick={() => setDetailsProduct(null)}
            aria-label="Close details"
          />
          <div className="quick-modal">
            <button
              className="modal-close"
              onClick={() => setDetailsProduct(null)}
              aria-label="Close"
            >
              <X />
            </button>
            <img src={detailsProduct.image} alt={detailsProduct.name} />
            <div>
              <p className="eyebrow">{detailsProduct.category}</p>
              <h2>{detailsProduct.name}</h2>
              <p>{detailsProduct.description}</p>
              <strong>{currency(detailsProduct.price)}</strong>
              <button
                className="primary-button"
                onClick={() => {
                  onAdd(detailsProduct);
                  setDetailsProduct(null);
                }}
              >
                Add to bag
              </button>
              <Link to={`/product/${detailsProduct.slug}`}>
                View full details
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const SHOP_THE_LOOK_HOTSPOTS: ShopTheLookHotspot[] = [
  { id: "face-base", label: "Face", top: "41%", left: "50%", area: "face" },
  { id: "lips", label: "Lips", top: "58%", left: "52%", area: "lips" },
  { id: "eyes", label: "Eyes", top: "36%", left: "46%", area: "eyes" },
  { id: "hair", label: "Hair", top: "18%", left: "58%", area: "hair" },
];

const K_BEAUTY_COLLECTION_SLUG = "k-beauty-k-pop-routine-inspired";

const K_BEAUTY_ASSORTMENT_BLUEPRINT: KBeautyAssortmentBlueprint[] = [
  {
    slug: "soft-rice-gel-cleanser",
    name: "Soft Rice Gel Cleanser",
    category: "Korean Skincare",
    routineStep: "Step 1 · Cleanser",
    skinConcern: "Dehydration and barrier",
    finish: "Fresh clean skin",
    inspiredByCopy:
      "Inspired by routines popular in K-pop beauty trends, focused on a low-irritation first cleanse before layered hydration.",
    variantExamples: ["Unscented", "Green Plum"],
    seedQuantity: 140,
  },
  {
    slug: "fermented-water-essence",
    name: "Fermented Water Essence",
    category: "Korean Skincare",
    routineStep: "Step 2 · Essence",
    skinConcern: "Tone and glow",
    finish: "Plump and luminous",
    inspiredByCopy:
      "Inspired by routines popular in K-pop beauty trends that build glow through light hydration layers.",
    variantExamples: ["Original", "Soothing"],
    seedQuantity: 120,
  },
  {
    slug: "niacinamide-glass-serum",
    name: "Niacinamide Glass Serum",
    category: "Korean Skincare",
    routineStep: "Step 3 · Serum",
    skinConcern: "Clarity and texture",
    finish: "Refined radiant finish",
    inspiredByCopy:
      "Inspired by routines popular in K-pop beauty trends that target uneven tone and texture while keeping skin calm.",
    variantExamples: ["5% Niacinamide", "Niacinamide + TXA"],
    seedQuantity: 110,
  },
  {
    slug: "ceramide-cloud-moisturizer",
    name: "Ceramide Cloud Moisturizer",
    category: "Korean Skincare",
    routineStep: "Step 4 · Moisturizer",
    skinConcern: "Dehydration and barrier",
    finish: "Supple dewy finish",
    inspiredByCopy:
      "Inspired by routines popular in K-pop beauty trends that lock in moisture without heavy residue before makeup.",
    variantExamples: ["Light", "Rich"],
    seedQuantity: 115,
  },
  {
    slug: "daily-skin-shield-spf50",
    name: "Daily Skin Shield SPF50",
    category: "Korean Skincare",
    routineStep: "Step 5 · SPF",
    skinConcern: "Tone and prevention",
    finish: "Natural skin-like",
    inspiredByCopy:
      "Inspired by routines popular in K-pop beauty trends that prioritize high-protection sunscreen for everyday wear and filming lights.",
    variantExamples: ["No cast", "Tone-up"],
    seedQuantity: 180,
  },
  {
    slug: "velvet-blur-lip-tint",
    name: "Velvet Blur Lip Tint",
    category: "Makeup",
    routineStep: "Step 6 · Lip tint",
    skinConcern: "Long-wear comfort",
    finish: "Soft matte",
    inspiredByCopy:
      "Inspired by routines popular in K-pop beauty trends, including lightweight diffused lip gradients for comfortable wear.",
    variantExamples: ["Fig Rose", "Cherry Brick", "Soft Coral"],
    seedQuantity: 160,
  },
  {
    slug: "second-skin-cushion-foundation",
    name: "Second Skin Cushion Foundation",
    category: "Makeup",
    routineStep: "Step 7 · Cushion",
    skinConcern: "Even tone and wear",
    finish: "Semi-dewy satin",
    inspiredByCopy:
      "Inspired by routines popular in K-pop beauty trends, using thin complexion layers that keep skin natural on camera.",
    variantExamples: ["21N", "23N", "25W"],
    seedQuantity: 170,
  },
];

function buildShopTheLookItems(products: ProductView[]) {
  const ranked = [...products].sort((a, b) => {
    const scoreA = a.rating * 100 + a.reviews;
    const scoreB = b.rating * 100 + b.reviews;
    return scoreB - scoreA;
  });

  return ranked
    .slice(0, SHOP_THE_LOOK_HOTSPOTS.length)
    .map((product, index) => {
      const hotspot = SHOP_THE_LOOK_HOTSPOTS[index];
      return {
        product,
        hotspot,
        shade: product.shades[0] || "Original",
      };
    });
}

function buildRoutineBundle(products: ProductView[], answers: RoutineAnswers) {
  const concernKeywords: Record<string, string[]> = {
    hydration: ["hydrate", "hydrating", "barrier", "moisture", "dewy", "plump"],
    clarity: ["clarity", "clear", "blemish", "acne", "pore", "purify"],
    glow: ["glow", "radiance", "bright", "luminous", "tone", "vitamin"],
    calm: ["calm", "soothe", "sensitive", "redness", "comfort", "balance"],
  };

  const focusCategories: Record<string, string[]> = {
    skin: ["skincare", "korean skincare", "facial tools"],
    makeup: ["makeup", "beauty accessories"],
    wellness: ["body", "supplements"],
  };

  const concernWords =
    concernKeywords[answers.concern] || concernKeywords.hydration;
  const categoryBoosts = focusCategories[answers.focus] || focusCategories.skin;
  const desiredCount = answers.cadence === "minimal" ? 3 : 4;

  const scored = products.map((product) => {
    const haystack =
      `${product.name} ${product.description} ${product.benefits.join(" ")}`.toLowerCase();
    const concernScore = concernWords.reduce(
      (sum, keyword) => (haystack.includes(keyword) ? sum + 2 : sum),
      0,
    );
    const categoryScore = categoryBoosts.includes(
      product.category.toLowerCase(),
    )
      ? 3
      : 0;
    const ratingScore = Math.max(0, product.rating) * 0.35;
    return {
      product,
      score: concernScore + categoryScore + ratingScore,
    };
  });

  const ranked = scored
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);

  return ranked.slice(0, Math.min(desiredCount, ranked.length));
}

function RoutineBuilderModal({
  products,
  onAdd,
  onClose,
}: {
  products: ProductView[];
  onAdd: (product: ProductView, shade?: string, quantity?: number) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<RoutineAnswers>({
    concern: "hydration",
    cadence: "minimal",
    focus: "skin",
  });

  const questions = [
    {
      id: "concern",
      title: "What is your top skin goal?",
      options: [
        { value: "hydration", label: "Hydration and barrier support" },
        { value: "clarity", label: "Clarify texture and breakouts" },
        { value: "glow", label: "Boost brightness and glow" },
        { value: "calm", label: "Soothe sensitivity and redness" },
      ],
    },
    {
      id: "cadence",
      title: "How detailed should your routine be?",
      options: [
        { value: "minimal", label: "Quick and simple (3 steps)" },
        { value: "balanced", label: "Balanced ritual (4 steps)" },
      ],
    },
    {
      id: "focus",
      title: "Which collection should lead your bundle?",
      options: [
        { value: "skin", label: "Skincare essentials first" },
        { value: "makeup", label: "Makeup-ready complexion" },
        { value: "wellness", label: "Body and wellness support" },
      ],
    },
  ] as const;

  const currentQuestion = questions[step];
  const routineBundle = useMemo(
    () => buildRoutineBundle(products, answers),
    [products, answers],
  );

  const setAnswer = (value: string) => {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: value,
    }));
  };

  const addBundleToBag = () => {
    routineBundle.forEach((product) => {
      onAdd(product, product.shades[0] || "Original", 1);
    });
    onClose();
  };

  return (
    <div
      className="modal-shell"
      role="dialog"
      aria-modal="true"
      aria-label="Routine builder quiz"
    >
      <button
        className="modal-backdrop"
        onClick={onClose}
        aria-label="Close routine builder"
      />
      <div className="routine-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X />
        </button>
        <p className="eyebrow">Interactive routine builder</p>
        <h2>Find your skincare routine</h2>
        <p className="routine-intro">
          Answer a quick quiz and get a curated bundle based on your goals.
        </p>

        <div className="routine-progress">
          <span
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="routine-question">
          <h3>{currentQuestion.title}</h3>
          <div className="routine-options">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  answers[currentQuestion.id] === option.value ? "selected" : ""
                }
                onClick={() => setAnswer(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="routine-nav">
          <button
            type="button"
            className="checkout-link"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
          >
            Back
          </button>
          {step < questions.length - 1 ? (
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                setStep((current) =>
                  Math.min(questions.length - 1, current + 1),
                )
              }
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="primary-button"
              onClick={addBundleToBag}
            >
              Add routine bundle
            </button>
          )}
        </div>

        <div className="routine-results">
          <h3>Recommended bundle</h3>
          <div className="routine-result-grid">
            {routineBundle.map((product, index) => (
              <article key={product.id} className="routine-result-card">
                <span>Step {index + 1}</span>
                <strong>{product.name}</strong>
                <p>{currency(product.price)}</p>
                <button
                  type="button"
                  className="checkout-link"
                  onClick={() =>
                    onAdd(product, product.shades[0] || "Original", 1)
                  }
                >
                  Add item
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getTryOnShadeColor(shade: string) {
  const palette = [
    "#8f4438",
    "#b85f58",
    "#d27b76",
    "#9d5c4f",
    "#c68b79",
    "#e0a08f",
    "#b87368",
    "#7f3e46",
    "#d39187",
    "#a96557",
  ];
  const hash = Array.from(shade).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  return palette[hash % palette.length];
}

function VirtualTryOn({
  product,
  selectedShade,
  onSelectShade,
  onClose,
}: {
  product: ProductView;
  selectedShade: string;
  onSelectShade: (shade: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const photoUrlRef = useRef("");
  const [mode, setMode] = useState<"idle" | "camera" | "photo">("idle");
  const [photoUrl, setPhotoUrl] = useState("");
  const [status, setStatus] = useState(
    "Use your camera or upload a clear, front-facing photo.",
  );
  const [isStartingCamera, setIsStartingCamera] = useState(false);

  const category = product.category.toLowerCase();
  const placement = category.includes("lip")
    ? "lips"
    : category.includes("foundation") ||
        category.includes("concealer") ||
        category.includes("makeup")
      ? "complexion"
      : "cheeks";

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    };
  }, [stopCamera]);

  const startCamera = async () => {
    setIsStartingCamera(true);
    setStatus("Requesting camera access...");
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setMode("camera");
      setStatus("Camera ready. Center your face, then find your match.");
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      }, 0);
    } catch {
      setMode("idle");
      setStatus(
        "Camera access was unavailable. Upload a photo to continue trying shades.",
      );
    } finally {
      setIsStartingCamera(false);
    }
  };

  const onPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    stopCamera();
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    const nextUrl = URL.createObjectURL(file);
    photoUrlRef.current = nextUrl;
    setPhotoUrl(nextUrl);
    setMode("photo");
    setStatus("Photo ready. Choose a shade or ask us to find your match.");
  };

  const findMatch = () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    canvas.width = 32;
    canvas.height = 32;

    try {
      if (mode === "camera" && videoRef.current?.videoWidth) {
        const video = videoRef.current;
        const sourceSize = Math.min(video.videoWidth, video.videoHeight);
        context.drawImage(
          video,
          (video.videoWidth - sourceSize) / 2,
          (video.videoHeight - sourceSize) / 2,
          sourceSize,
          sourceSize,
          0,
          0,
          32,
          32,
        );
      } else if (
        mode === "photo" &&
        imageRef.current?.complete &&
        imageRef.current.naturalWidth
      ) {
        const image = imageRef.current;
        const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
        context.drawImage(
          image,
          (image.naturalWidth - sourceSize) / 2,
          (image.naturalHeight - sourceSize) / 2,
          sourceSize,
          sourceSize,
          0,
          0,
          32,
          32,
        );
      } else {
        setStatus("Start the camera or upload a photo before matching.");
        return;
      }

      const pixels = context.getImageData(10, 10, 12, 12).data;
      let red = 0;
      let green = 0;
      let blue = 0;
      let samples = 0;

      for (let index = 0; index < pixels.length; index += 4) {
        red += pixels[index];
        green += pixels[index + 1];
        blue += pixels[index + 2];
        samples += 1;
      }

      const warmth = (red / samples - blue / samples + 255) / 510;
      const brightness =
        ((red / samples) * 0.299 +
          (green / samples) * 0.587 +
          (blue / samples) * 0.114) /
        255;
      const matchPosition = Math.min(
        product.shades.length - 1,
        Math.max(
          0,
          Math.round(
            (brightness * 0.72 + warmth * 0.28) *
              Math.max(0, product.shades.length - 1),
          ),
        ),
      );
      const match = product.shades[matchPosition] || product.shades[0];
      onSelectShade(match);
      setStatus(
        `${match} is your closest digital match. Preview it and adjust if needed.`,
      );
    } catch {
      setStatus(
        "We could not sample this image. You can still compare shades manually.",
      );
    }
  };

  return (
    <div
      className="modal-shell"
      role="dialog"
      aria-modal="true"
      aria-label={`Virtual try-on for ${product.name}`}
    >
      <button
        className="modal-backdrop"
        onClick={onClose}
        aria-label="Close virtual try-on"
      />
      <div className="try-on-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X />
        </button>
        <div className="try-on-preview">
          {mode === "camera" ? (
            <video
              ref={videoRef}
              muted
              playsInline
              aria-label="Live camera preview"
            />
          ) : mode === "photo" ? (
            <img ref={imageRef} src={photoUrl} alt="Uploaded try-on preview" />
          ) : (
            <div className="try-on-empty">
              <Sparkles size={32} />
              <p>Your virtual mirror will appear here.</p>
            </div>
          )}
          {mode !== "idle" ? (
            <div
              className={`try-on-overlay ${placement}`}
              style={{ backgroundColor: getTryOnShadeColor(selectedShade) }}
              aria-hidden="true"
            />
          ) : null}
          <span className="try-on-disclaimer">
            Digital preview · Color may vary by screen and lighting
          </span>
        </div>
        <div className="try-on-controls">
          <p className="eyebrow">Virtual try-on</p>
          <h2>Meet your match</h2>
          <p>
            Preview {product.name} with your live camera or a photo. Your image
            stays in this browser and is not uploaded.
          </p>
          <div className="try-on-source-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => void startCamera()}
              disabled={isStartingCamera}
            >
              <Camera size={16} />
              {isStartingCamera ? "Starting..." : "Use camera"}
            </button>
            <label className="try-on-upload">
              <ImageUp size={16} />
              Upload photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onPhotoChange}
              />
            </label>
          </div>
          <div className="try-on-status" role="status" aria-live="polite">
            {status}
          </div>
          <div className="try-on-shades" aria-label="Try-on shades">
            {product.shades.map((item) => (
              <button
                key={item}
                type="button"
                className={selectedShade === item ? "selected" : ""}
                onClick={() => {
                  onSelectShade(item);
                  setStatus(`${item} selected for your digital preview.`);
                }}
              >
                <span style={{ backgroundColor: getTryOnShadeColor(item) }} />
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="try-on-match"
            onClick={findMatch}
            disabled={mode === "idle"}
          >
            <Sparkles size={16} />
            Find my shade match
          </button>
          <button type="button" className="checkout-link" onClick={onClose}>
            Use {selectedShade}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductPage({
  products,
  onAdd,
  isPending,
  error,
  isWishlisted,
  onToggleWishlist,
}: {
  products: ProductView[];
  onAdd: (product: ProductView, shade?: string, quantity?: number) => void;
  isPending: boolean;
  error: Error | null;
  isWishlisted: boolean;
  onToggleWishlist: (product: ProductView) => void;
}) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = products.find((item) => item.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [shade, setShade] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (product) {
      setShade(product.shades[0] || "Default");
      setQuantity(1);
    }
  }, [product]);

  if (isPending) {
    return <ProductPageSkeleton />;
  }

  if (error) {
    return (
      <LoadingOrErrorState
        isPending={false}
        error={error}
        errorLabel="Product unavailable"
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!product) {
    return (
      <main className="not-found">
        <h1>Product not found</h1>
        <Link to="/">Return home</Link>
      </main>
    );
  }

  return (
    <main className="product-page" id="main-content">
      <button className="back-link" onClick={() => navigate(-1)}>
        <ArrowLeft size={17} /> Back to shop
      </button>
      <div className="product-detail">
        <div className="detail-image">
          {product.badge && (
            <span className="product-badge">{product.badge}</span>
          )}
          <img src={product.image} alt={product.name} />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{product.category} / Bloom$Balance</p>
          <h1>{product.name}</h1>
          <div className="rating">
            <Star size={15} fill="currentColor" /> {product.rating}{" "}
            <span>{product.reviews} reviews</span>
          </div>
          <p className="detail-price">{currency(product.price)}</p>
          <p className="detail-description">{product.description}</p>
          <div className="routine-compliance-note">
            <p className="eyebrow">{product.routineProfile.routineStep}</p>
            <p>{product.routineProfile.inspiredByCopy}</p>
            <p>{product.routineProfile.sourceTransparencyNote}</p>
          </div>
          <button
            type="button"
            className={
              isWishlisted ? "wishlist-toggle active" : "wishlist-toggle"
            }
            aria-pressed={isWishlisted}
            onClick={() => onToggleWishlist(product)}
          >
            <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
            {isWishlisted ? "Saved to wishlist" : "Save to wishlist"}
          </button>
          <div className="benefit-list">
            {product.benefits.map((benefit) => (
              <span key={benefit}>
                <Check size={14} /> {benefit}
              </span>
            ))}
          </div>
          <div className="variation-heading">
            <strong>
              {product.pdpSupport.selectionLabel}: {shade}
            </strong>
            <button onClick={() => setGuideOpen(true)}>Selection guide</button>
          </div>
          <button
            type="button"
            className="virtual-try-on-button"
            onClick={() => setTryOnOpen(true)}
          >
            <Camera size={17} />
            Try it on virtually
            <span>Camera or photo</span>
          </button>
          <div className="shade-options">
            {product.shades.map((item) => (
              <button
                key={item}
                type="button"
                className={shade === item ? "selected" : ""}
                onClick={() => setShade(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="purchase-row">
            <div className="quantity">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              className="primary-button"
              onClick={() => onAdd(product, shade, quantity)}
            >
              Add to bag — {currency(product.price * quantity)}
            </button>
          </div>
          <div className="checkout-trust">
            <span>
              <LockKeyhole size={16} /> Secure checkout
            </span>
            <span>
              <Truck size={16} /> Free shipping over $50
            </span>
          </div>
          <details open>
            <summary>
              How to use <Plus size={16} />
            </summary>
            <p>{product.pdpSupport.howToUse}</p>
          </details>
          <details>
            <summary>
              Full details <Plus size={16} />
            </summary>
            <p>{product.pdpSupport.fullDetails}</p>
          </details>
          <p className="eyebrow">Schema version: v{product.version}</p>
        </div>
      </div>
      {tryOnOpen && (
        <VirtualTryOn
          product={product}
          selectedShade={shade}
          onSelectShade={setShade}
          onClose={() => setTryOnOpen(false)}
        />
      )}
      {guideOpen && (
        <div
          className="modal-shell"
          role="dialog"
          aria-modal="true"
          aria-label="Selection guide"
        >
          <button
            className="modal-backdrop"
            onClick={() => setGuideOpen(false)}
            aria-label="Close guide"
          />
          <div className="guide-modal">
            <button
              className="modal-close"
              onClick={() => setGuideOpen(false)}
              aria-label="Close"
            >
              <X />
            </button>
            <p className="eyebrow">{product.pdpSupport.guide.eyebrow}</p>
            <h2>{product.pdpSupport.guide.title}</h2>
            <p>{product.pdpSupport.guide.copy}</p>
            {product.pdpSupport.guide.steps.map((step, index) => (
              <div className="guide-steps" key={`${step.title}-${index}`}>
                <span>{index + 1}</span>
                <p>
                  <strong>{step.title}</strong>
                  {step.copy}
                </p>
              </div>
            ))}
            <button
              className="primary-button"
              onClick={() => setGuideOpen(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function CartDrawer({
  items,
  open,
  onClose,
  onUpdate,
  onRemove,
  onSaveCart,
  onRestoreCart,
  savedCartCount,
}: {
  items: CartItem[];
  open: boolean;
  onClose: () => void;
  onUpdate: (index: number, quantity: number) => void;
  onRemove: (index: number) => void;
  onSaveCart: () => void;
  onRestoreCart: () => void;
  savedCartCount: number;
}) {
  const navigate = useNavigate();
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <div
      className={open ? "cart-shell open" : "cart-shell"}
      aria-hidden={!open}
    >
      <button
        className="cart-backdrop"
        onClick={onClose}
        aria-label="Close cart"
      />
      <aside className="cart-drawer" aria-label="Shopping bag">
        <div className="cart-header">
          <h2>
            Your bag{" "}
            <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </h2>
          <button onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
        {items.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={34} />
            <h3>Your bag is ready to bloom.</h3>
            <p>Explore our considered essentials and find your new ritual.</p>
            <button className="primary-button" onClick={onClose}>
              Continue shopping
            </button>
            {savedCartCount > 0 ? (
              <button className="checkout-link" onClick={onRestoreCart}>
                Restore saved cart ({savedCartCount} items)
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="shipping-progress">
              <p>
                {subtotal >= 50
                  ? "You unlocked free shipping."
                  : `${currency(50 - subtotal)} away from free shipping`}
              </p>
              <div>
                <span style={{ width: `${Math.min(100, subtotal * 2)}%` }} />
              </div>
            </div>
            <div className="cart-items">
              {items.map((item, index) => (
                <div
                  className="cart-item"
                  key={`${item.product.id}-${item.shade}-${index}`}
                >
                  <img src={item.product.image} alt={item.product.name} />
                  <div>
                    <p className="eyebrow">{item.product.category}</p>
                    <h3>{item.product.name}</h3>
                    <p>{item.shade}</p>
                    <div className="cart-item-actions">
                      <div className="quantity small">
                        <button
                          onClick={() =>
                            onUpdate(index, Math.max(1, item.quantity - 1))
                          }
                        >
                          <Minus size={13} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => onUpdate(index, item.quantity + 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        className="remove"
                        onClick={() => onRemove(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <strong>
                    {currency(item.product.price * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div>
                <span>Subtotal</span>
                <strong>{currency(subtotal)}</strong>
              </div>
              <p>Taxes and shipping calculated at checkout.</p>
              <button
                className="primary-button"
                onClick={() => {
                  onClose();
                  navigate("/checkout");
                }}
              >
                <LockKeyhole size={16} /> Secure checkout
              </button>
              <div className="cart-secondary-actions">
                <button className="checkout-link" onClick={onSaveCart}>
                  Save cart for later
                </button>
                {savedCartCount > 0 ? (
                  <button className="checkout-link" onClick={onRestoreCart}>
                    Restore saved cart
                  </button>
                ) : null}
              </div>
              <span className="cart-trust">
                <ShieldCheck size={16} /> Protected payment and easy returns
              </span>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function CheckoutPage({
  cart,
  onCheckoutSuccess,
}: {
  cart: CartItem[];
  onCheckoutSuccess: () => void;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const retryOrder = searchParams.get("retryOrder");
  const { user } = useAuth();

  const { query: queryVariants } = useLazyQuery("ProductVariant");
  const { query: queryInventory } = useLazyQuery("Inventory");

  const orderMutation = useMutation("Order");
  const orderLineItemMutation = useMutation("OrderLineItem");
  const inventoryMutation = useMutation("Inventory");
  const emailDispatchMutation = useMutation("EmailDispatch");

  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const [form, setForm] = useState<CheckoutFormValues>({
    customerName: "",
    customerEmail: "",
    shippingLine1: "",
    shippingLine2: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
    shippingCountry: "US",
    billingSameAsShipping: true,
    billingLine1: "",
    billingLine2: "",
    billingCity: "",
    billingState: "",
    billingPostalCode: "",
    billingCountry: "US",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvc: "",
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      customerName: current.customerName || user?.name || "",
      customerEmail: current.customerEmail || user?.email || "",
    }));
  }, [user?.name, user?.email]);

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  );
  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 6;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));
  const currencyCode = "USD";

  const onChangeField = (
    field: keyof CheckoutFormValues,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!form.customerName.trim() || !form.customerEmail.trim()) {
      return "Name and email are required.";
    }
    if (
      !form.shippingLine1.trim() ||
      !form.shippingCity.trim() ||
      !form.shippingPostalCode.trim()
    ) {
      return "Shipping address is incomplete.";
    }
    if (!form.billingSameAsShipping) {
      if (
        !form.billingLine1.trim() ||
        !form.billingCity.trim() ||
        !form.billingPostalCode.trim()
      ) {
        return "Billing address is incomplete.";
      }
    }
    if (
      !form.cardNumber.trim() ||
      !form.cardName.trim() ||
      !form.cardExpiry.trim() ||
      !form.cardCvc.trim()
    ) {
      return "Payment details are incomplete.";
    }
    return "";
  };

  const resolveCheckoutLines = async () => {
    const lines: CheckoutResolvedLine[] = [];
    for (const cartItem of cart) {
      const variants = await queryVariants.query({
        where: { productId: { eq: cartItem.product.id } },
        orderBy: { createdAt: "asc" },
      });

      if (!variants.length) {
        throw new Error(
          `No purchasable variant exists for ${cartItem.product.name}.`,
        );
      }

      const requestedShade = normalizeShadeName(cartItem.shade);
      const matchedVariant =
        variants.find(
          (variant) => normalizeShadeName(variant.shadeName) === requestedShade,
        ) || variants[0];

      const inventoryRows = await queryInventory.query({
        where: { variantId: { eq: matchedVariant.id } },
        orderBy: { createdAt: "asc" },
      });

      const availableQuantity = inventoryRows.reduce(
        (sum, row) => sum + Math.max(0, Number(row.quantity) || 0),
        0,
      );

      if (availableQuantity < cartItem.quantity) {
        throw new Error(
          `${cartItem.product.name} is out of stock for the selected quantity.`,
        );
      }

      const unitPrice =
        matchedVariant.priceOverride !== undefined
          ? Number(matchedVariant.priceOverride)
          : cartItem.product.price;

      lines.push({
        cartItem,
        variant: matchedVariant,
        inventoryRows,
        requestedQuantity: cartItem.quantity,
        unitPrice,
        lineTotal: Number((unitPrice * cartItem.quantity).toFixed(2)),
      });
    }
    return lines;
  };

  const consumeInventory = async (lines: CheckoutResolvedLine[]) => {
    for (const line of lines) {
      let remaining = line.requestedQuantity;
      for (const stockRow of line.inventoryRows) {
        if (remaining <= 0) break;
        const currentQty = Math.max(0, Number(stockRow.quantity) || 0);
        if (currentQty === 0) continue;
        const nextQty = Math.max(0, currentQty - remaining);
        const consumed = currentQty - nextQty;
        remaining -= consumed;
        await inventoryMutation.update(stockRow.id, { quantity: nextQty });
      }
      if (remaining > 0) {
        throw new Error(
          `Stock update failed for ${line.cartItem.product.name}.`,
        );
      }
    }
  };

  const onSubmitCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutError("");

    if (!cart.length) {
      setCheckoutError("Your bag is empty.");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setCheckoutError(validationError);
      return;
    }

    setProcessing(true);

    let createdOrder: any = null;

    try {
      const lines = await resolveCheckoutLines();
      const orderNumber = generateOrderNumber();

      const shippingAddressPayload = JSON.stringify({
        line1: form.shippingLine1,
        line2: form.shippingLine2,
        city: form.shippingCity,
        state: form.shippingState,
        postalCode: form.shippingPostalCode,
        country: form.shippingCountry,
      });

      const billingAddressPayload = form.billingSameAsShipping
        ? shippingAddressPayload
        : JSON.stringify({
            line1: form.billingLine1,
            line2: form.billingLine2,
            city: form.billingCity,
            state: form.billingState,
            postalCode: form.billingPostalCode,
            country: form.billingCountry,
          });

      createdOrder = await orderMutation.create({
        orderNumber,
        customerEmail: form.customerEmail.trim().toLowerCase(),
        customerName: form.customerName.trim(),
        status: "pending",
        paymentStatus: "pending",
        paymentProvider: "stripe-simulated",
        subtotal: Number(subtotal.toFixed(2)),
        shipping: Number(shipping.toFixed(2)),
        tax,
        total,
        currency: currencyCode,
        shippingAddress: shippingAddressPayload,
        billingAddress: billingAddressPayload,
        notes: retryOrder ? `Retrying payment for ${retryOrder}` : undefined,
      });

      for (const line of lines) {
        await orderLineItemMutation.create({
          orderId: createdOrder.id,
          productId: line.cartItem.product.id,
          variantId: line.variant.id,
          sku: line.variant.sku || `${line.cartItem.product.slug}-DEFAULT`,
          productName: line.cartItem.product.name,
          shadeName: line.cartItem.shade,
          unitPrice: line.unitPrice,
          quantity: line.requestedQuantity,
          lineTotal: line.lineTotal,
        });
      }

      const paymentReference = await processPayment({
        provider: "stripe-sim",
        cardNumber: form.cardNumber,
        amount: total,
        currencyCode,
      });

      await consumeInventory(lines);

      await orderMutation.update(createdOrder.id, {
        status: "paid",
        paymentStatus: "authorized",
        paymentReference,
      });

      const queuedDispatch = await emailDispatchMutation.create({
        orderId: createdOrder.id,
        recipient: form.customerEmail.trim().toLowerCase(),
        template: "order_confirmation_v1",
        provider: "internal-mailer",
        status: "queued",
        payload: JSON.stringify({
          orderNumber: createdOrder.orderNumber,
          customerName: form.customerName.trim(),
          total,
          currency: currencyCode,
        }),
      });

      await emailDispatchMutation.update(queuedDispatch.id, {
        status: "sent",
      });

      onCheckoutSuccess();
      navigate(`/order/${createdOrder.orderNumber}?status=success`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Checkout failed.";

      if (createdOrder) {
        await orderMutation.update(createdOrder.id, {
          status: "failed",
          paymentStatus: "failed",
          failureReason: message,
        });

        await emailDispatchMutation.create({
          orderId: createdOrder.id,
          recipient: form.customerEmail.trim().toLowerCase(),
          template: "order_failed_v1",
          provider: "internal-mailer",
          status: "failed",
          payload: JSON.stringify({
            orderNumber: createdOrder.orderNumber,
            reason: message,
          }),
          errorMessage: message,
        });

        navigate(`/order/${createdOrder.orderNumber}?status=failure`);
      } else {
        setCheckoutError(message);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (!cart.length) {
    return (
      <main className="checkout-page" id="main-content">
        <div className="checkout-shell">
          <h1>Checkout</h1>
          <p>Your bag is currently empty.</p>
          <button className="primary-button" onClick={() => navigate("/")}>
            Return to shop
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page" id="main-content">
      <div className="checkout-shell">
        <div className="checkout-heading">
          <h1>Secure checkout</h1>
          {retryOrder ? (
            <p>Retrying payment for order {retryOrder}.</p>
          ) : (
            <p>
              Complete your order with secure payment and live stock validation.
            </p>
          )}
        </div>

        {checkoutError ? (
          <div className="checkout-error" role="alert" aria-live="assertive">
            <p>{checkoutError}</p>
            <button
              type="button"
              className="checkout-link"
              onClick={() => setCheckoutError("")}
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <form
          className="checkout-layout"
          onSubmit={onSubmitCheckout}
          aria-busy={processing}
        >
          <section className="checkout-panel">
            <h2>Contact</h2>
            <div className="checkout-grid">
              <label>
                Full name
                <input
                  value={form.customerName}
                  onChange={(event) =>
                    onChangeField("customerName", event.target.value)
                  }
                  autoComplete="name"
                  disabled={processing}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={(event) =>
                    onChangeField("customerEmail", event.target.value)
                  }
                  autoComplete="email"
                  disabled={processing}
                />
              </label>
            </div>

            <h2>Shipping address</h2>
            <div className="checkout-grid">
              <label className="wide">
                Address line 1
                <input
                  value={form.shippingLine1}
                  onChange={(event) =>
                    onChangeField("shippingLine1", event.target.value)
                  }
                  autoComplete="shipping address-line1"
                  disabled={processing}
                />
              </label>
              <label className="wide">
                Address line 2
                <input
                  value={form.shippingLine2}
                  onChange={(event) =>
                    onChangeField("shippingLine2", event.target.value)
                  }
                  disabled={processing}
                />
              </label>
              <label>
                City
                <input
                  value={form.shippingCity}
                  onChange={(event) =>
                    onChangeField("shippingCity", event.target.value)
                  }
                  disabled={processing}
                />
              </label>
              <label>
                State
                <input
                  value={form.shippingState}
                  onChange={(event) =>
                    onChangeField("shippingState", event.target.value)
                  }
                  disabled={processing}
                />
              </label>
              <label>
                Postal code
                <input
                  value={form.shippingPostalCode}
                  onChange={(event) =>
                    onChangeField("shippingPostalCode", event.target.value)
                  }
                  autoComplete="shipping postal-code"
                  disabled={processing}
                />
              </label>
              <label>
                Country
                <input
                  value={form.shippingCountry}
                  onChange={(event) =>
                    onChangeField("shippingCountry", event.target.value)
                  }
                  disabled={processing}
                />
              </label>
            </div>

            <h2>Billing address</h2>
            <label className="checkout-toggle">
              <input
                type="checkbox"
                checked={form.billingSameAsShipping}
                onChange={(event) =>
                  onChangeField("billingSameAsShipping", event.target.checked)
                }
                disabled={processing}
              />
              Use shipping address for billing
            </label>

            {!form.billingSameAsShipping ? (
              <div className="checkout-grid">
                <label className="wide">
                  Billing line 1
                  <input
                    value={form.billingLine1}
                    onChange={(event) =>
                      onChangeField("billingLine1", event.target.value)
                    }
                    disabled={processing}
                  />
                </label>
                <label className="wide">
                  Billing line 2
                  <input
                    value={form.billingLine2}
                    onChange={(event) =>
                      onChangeField("billingLine2", event.target.value)
                    }
                    disabled={processing}
                  />
                </label>
                <label>
                  City
                  <input
                    value={form.billingCity}
                    onChange={(event) =>
                      onChangeField("billingCity", event.target.value)
                    }
                    disabled={processing}
                  />
                </label>
                <label>
                  State
                  <input
                    value={form.billingState}
                    onChange={(event) =>
                      onChangeField("billingState", event.target.value)
                    }
                    disabled={processing}
                  />
                </label>
                <label>
                  Postal code
                  <input
                    value={form.billingPostalCode}
                    onChange={(event) =>
                      onChangeField("billingPostalCode", event.target.value)
                    }
                    disabled={processing}
                  />
                </label>
                <label>
                  Country
                  <input
                    value={form.billingCountry}
                    onChange={(event) =>
                      onChangeField("billingCountry", event.target.value)
                    }
                    disabled={processing}
                  />
                </label>
              </div>
            ) : null}

            <h2>Payment</h2>
            <div className="checkout-grid">
              <label className="wide">
                Card number
                <input
                  value={form.cardNumber}
                  onChange={(event) =>
                    onChangeField("cardNumber", event.target.value)
                  }
                  autoComplete="cc-number"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  disabled={processing}
                />
              </label>
              <label>
                Name on card
                <input
                  value={form.cardName}
                  onChange={(event) =>
                    onChangeField("cardName", event.target.value)
                  }
                  autoComplete="cc-name"
                  disabled={processing}
                />
              </label>
              <label>
                Expiry
                <input
                  value={form.cardExpiry}
                  onChange={(event) =>
                    onChangeField("cardExpiry", event.target.value)
                  }
                  autoComplete="cc-exp"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  disabled={processing}
                />
              </label>
              <label>
                CVC
                <input
                  value={form.cardCvc}
                  onChange={(event) =>
                    onChangeField("cardCvc", event.target.value)
                  }
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  disabled={processing}
                />
              </label>
            </div>
          </section>

          <aside className="checkout-summary">
            <h2>Order summary</h2>
            <div className="checkout-items">
              {cart.map((item, index) => (
                <div key={`${item.product.id}-${item.shade}-${index}`}>
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <strong>
                    {currency(item.product.price * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>
            <div className="checkout-totals">
              <p>
                <span>Subtotal</span>
                <strong>{currency(subtotal)}</strong>
              </p>
              <p>
                <span>Shipping</span>
                <strong>{shipping === 0 ? "Free" : currency(shipping)}</strong>
              </p>
              <p>
                <span>Tax</span>
                <strong>{currency(tax)}</strong>
              </p>
              <p className="grand-total">
                <span>Total</span>
                <strong>{currency(total)}</strong>
              </p>
            </div>
            <button
              className="primary-button"
              type="submit"
              disabled={processing}
            >
              {processing ? "Processing..." : "Pay now"}
            </button>
            <button
              type="button"
              className="checkout-link"
              onClick={() => navigate("/")}
              disabled={processing}
            >
              Continue shopping
            </button>
          </aside>
        </form>
      </div>
    </main>
  );
}

function OrderConfirmationPage() {
  const { orderNumber = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requestedStatus = searchParams.get("status");
  const orderResult = useQuery("Order", {
    where: { orderNumber: { eq: orderNumber } },
    limit: 1,
  });
  const order = orderResult.data?.[0];

  const lineItemsResult = useQuery("OrderLineItem", {
    where: { orderId: { eq: order?.id || "__missing__" } },
    orderBy: { createdAt: "asc" },
  });

  if (orderResult.isPending || lineItemsResult.isPending) {
    return (
      <main className="order-status-page" id="main-content" aria-busy="true">
        <div className="order-status-shell">
          <div className="skeleton-line medium" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      </main>
    );
  }

  if (orderResult.error || lineItemsResult.error) {
    return (
      <main className="order-status-page" id="main-content">
        <div className="order-status-shell">
          <h1>Unable to load order</h1>
          <p>{(orderResult.error || lineItemsResult.error)?.message}</p>
          <div className="order-status-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
            <button
              className="checkout-link"
              type="button"
              onClick={() => navigate("/")}
            >
              Return home
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="order-status-page">
        <div className="order-status-shell">
          <h1>Order not found</h1>
          <p>The order reference may be incorrect.</p>
          <button className="primary-button" onClick={() => navigate("/")}>
            Return home
          </button>
        </div>
      </main>
    );
  }

  const lineItems = lineItemsResult.data || [];
  const status =
    requestedStatus === "success"
      ? "success"
      : requestedStatus === "failure"
        ? "failure"
        : order.status === "paid"
          ? "success"
          : order.status === "failed"
            ? "failure"
            : "pending";

  return (
    <main className="order-status-page">
      <div className="order-status-shell">
        <p className="eyebrow">Order {order.orderNumber}</p>
        <h1>
          {status === "success"
            ? "Payment successful"
            : status === "failure"
              ? "Payment failed"
              : "Order pending"}
        </h1>
        <p>
          {status === "success"
            ? "Your order is confirmed and a confirmation email has been queued."
            : status === "failure"
              ? order.failureReason || "The payment could not be completed."
              : "Your order is being processed."}
        </p>

        <div className="order-status-meta">
          <div>
            <span>Total</span>
            <strong>{currency(order.total || 0)}</strong>
          </div>
          <div>
            <span>Payment</span>
            <strong>{order.paymentStatus}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{order.status}</strong>
          </div>
        </div>

        {lineItems.length ? (
          <div className="order-status-lines">
            {lineItems.map((line) => (
              <p key={line.id}>
                <span>
                  {line.productName} ({line.shadeName}) × {line.quantity}
                </span>
                <strong>{currency(line.lineTotal)}</strong>
              </p>
            ))}
          </div>
        ) : null}

        <div className="order-status-actions">
          {status === "failure" ? (
            <button
              className="primary-button"
              onClick={() =>
                navigate(`/checkout?retryOrder=${order.orderNumber}`)
              }
            >
              Retry payment
            </button>
          ) : null}
          <button className="checkout-link" onClick={() => navigate("/")}>
            Back to storefront
          </button>
        </div>
      </div>
    </main>
  );
}

function AccountPage({
  products,
  wishlistItems,
  onToggleWishlist,
  savedCarts,
  onRestoreSavedCart,
  onAddToCart,
}: {
  products: ProductView[];
  wishlistItems: WishlistItem[];
  onToggleWishlist: (product: ProductView) => void;
  savedCarts: SavedCartSnapshot[];
  onRestoreSavedCart: (snapshotId?: string) => void;
  onAddToCart: (
    product: ProductView,
    shade?: string,
    quantity?: number,
  ) => void;
}) {
  const { user, isPending, error, isAnonymous, login } = useAuth();
  const navigate = useNavigate();

  const customerEmail = user?.email?.trim().toLowerCase();
  const ordersResult = useQuery("Order", {
    where: customerEmail
      ? { customerEmail: { eq: customerEmail } }
      : { customerEmail: { eq: "__anonymous__" } },
    orderBy: { createdAt: "desc" },
    limit: 25,
  });

  const wishlistProducts = wishlistItems
    .map((item) => products.find((product) => product.id === item.productId))
    .filter((product): product is ProductView => Boolean(product));

  const getSavedCartItemCount = (snapshot: SavedCartSnapshot) =>
    snapshot.items.reduce((sum, item) => sum + item.quantity, 0);

  if (isPending) {
    return <AccountSkeleton />;
  }

  if (error || ordersResult.error) {
    return (
      <main className="account-page" id="main-content">
        <div className="account-shell">
          <h1>Account unavailable</h1>
          <p>{(error || ordersResult.error)?.message}</p>
          <button
            className="primary-button"
            type="button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (isAnonymous) {
    return (
      <main className="account-page">
        <div className="account-shell">
          <h1>Your account</h1>
          <p>Sign in to view orders, save carts, and manage your wishlist.</p>
          <button className="primary-button" onClick={() => void login()}>
            Sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="account-page" id="main-content">
      <div className="account-shell">
        <div className="account-heading">
          <div>
            <p className="eyebrow">Customer account</p>
            <h1>{user?.name || "My account"}</h1>
          </div>
          <p>{user?.email}</p>
        </div>

        <section className="account-section">
          <div className="account-section-header">
            <h2>Saved carts</h2>
          </div>
          {savedCarts.length ? (
            <div className="account-saved-carts">
              {savedCarts.map((snapshot) => (
                <article key={snapshot.id} className="account-saved-card">
                  <div className="account-saved-head">
                    <p>
                      Saved {new Date(snapshot.createdAt).toLocaleString()} ·{" "}
                      {getSavedCartItemCount(snapshot)} items
                    </p>
                    <button
                      className="checkout-link"
                      onClick={() => onRestoreSavedCart(snapshot.id)}
                    >
                      Restore
                    </button>
                  </div>
                  <div className="account-order-list">
                    {snapshot.items.map((item, index) => (
                      <p
                        key={`${snapshot.id}-${item.product.id}-${item.shade}-${index}`}
                      >
                        <span>
                          {item.product.name} ({item.shade}) × {item.quantity}
                        </span>
                        <strong>
                          {currency(item.product.price * item.quantity)}
                        </strong>
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="account-empty">No saved carts yet.</p>
          )}
        </section>

        <section className="account-section">
          <div className="account-section-header">
            <h2>Wishlist</h2>
          </div>
          {wishlistProducts.length ? (
            <div className="account-grid">
              {wishlistProducts.map((product) => (
                <article key={product.id} className="account-card">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <h3>{product.name}</h3>
                    <p>{currency(product.price)}</p>
                    <div className="account-card-actions">
                      <button
                        className="checkout-link"
                        onClick={() =>
                          onAddToCart(
                            product,
                            product.shades[0] || "Original",
                            1,
                          )
                        }
                      >
                        Add to bag
                      </button>
                      <button
                        className="checkout-link"
                        onClick={() => navigate(`/product/${product.slug}`)}
                      >
                        View
                      </button>
                      <button
                        className="checkout-link"
                        onClick={() => onToggleWishlist(product)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="account-empty">Your wishlist is empty.</p>
          )}
        </section>

        <section className="account-section">
          <div className="account-section-header">
            <h2>Recent orders</h2>
          </div>
          {ordersResult.isPending ? (
            <p className="account-empty">Loading orders...</p>
          ) : ordersResult.data?.length ? (
            <div className="account-order-list">
              {(ordersResult.data || []).map((order) => (
                <p key={order.id}>
                  <span>
                    {order.orderNumber} · {order.status} · {order.paymentStatus}
                  </span>
                  <strong>{currency(order.total)}</strong>
                </p>
              ))}
            </div>
          ) : (
            <p className="account-empty">No orders yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}

function CmsPage() {
  const {
    user,
    isPending: authPending,
    error: authError,
    isAnonymous,
    login,
  } = useAuth();

  const productsResult = useQuery("Product", {
    orderBy: { updatedAt: "desc" },
  });
  const variantsResult = useQuery("ProductVariant", {
    orderBy: { updatedAt: "desc" },
  });
  const inventoryResult = useQuery("Inventory", {
    orderBy: { updatedAt: "desc" },
  });
  const collectionsResult = useQuery("Collection", {
    orderBy: { updatedAt: "desc" },
  });
  const editorialResult = useQuery("EditorialBlock", {
    orderBy: { updatedAt: "desc" },
  });

  const productMutation = useMutation("Product");
  const variantMutation = useMutation("ProductVariant");
  const inventoryMutation = useMutation("Inventory");
  const collectionMutation = useMutation("Collection");
  const editorialMutation = useMutation("EditorialBlock");

  const [activeTab, setActiveTab] = useState<CmsTab>("products");
  const [cmsError, setCmsError] = useState("");
  const [editingProductId, setEditingProductId] = useState("");
  const [editingVariantId, setEditingVariantId] = useState("");
  const [editingInventoryId, setEditingInventoryId] = useState("");
  const [editingCollectionId, setEditingCollectionId] = useState("");
  const [editingEditorialId, setEditingEditorialId] = useState("");

  const [productDraft, setProductDraft] = useState({
    name: "",
    slug: "",
    category: "Skincare",
    description: "",
    price: "0",
    rating: "4.8",
    reviews: "0",
    image: "",
    badge: "",
    benefits: "Hydrating,Barrier support",
    status: "draft",
  });

  const [variantDraft, setVariantDraft] = useState({
    productId: "",
    sku: "",
    shadeName: "",
    priceOverride: "",
  });

  const [inventoryDraft, setInventoryDraft] = useState({
    variantId: "",
    quantity: "0",
    location: "main-warehouse",
  });

  const [collectionDraft, setCollectionDraft] = useState({
    title: "",
    slug: "",
    description: "",
  });

  const [editorialDraft, setEditorialDraft] = useState({
    sectionId: "",
    content: '{\n  "copy": "Add content",\n  "version": 1\n}',
    isActive: true,
  });

  const products = productsResult.data || [];
  const variants = variantsResult.data || [];
  const inventory = inventoryResult.data || [];
  const collections = collectionsResult.data || [];
  const editorialBlocks = editorialResult.data || [];

  const dataPending =
    productsResult.isPending ||
    variantsResult.isPending ||
    inventoryResult.isPending ||
    collectionsResult.isPending ||
    editorialResult.isPending;

  const dataError =
    productsResult.error ||
    variantsResult.error ||
    inventoryResult.error ||
    collectionsResult.error ||
    editorialResult.error;

  const mutating =
    productMutation.isPending ||
    variantMutation.isPending ||
    inventoryMutation.isPending ||
    collectionMutation.isPending ||
    editorialMutation.isPending;

  const tabConfig: { id: CmsTab; label: string }[] = [
    { id: "products", label: "Products" },
    { id: "variants", label: "Variants" },
    { id: "inventory", label: "Inventory" },
    { id: "collections", label: "Collections" },
    { id: "editorial", label: "Editorial" },
  ];

  const resetProductDraft = () => {
    setEditingProductId("");
    setProductDraft({
      name: "",
      slug: "",
      category: "Skincare",
      description: "",
      price: "0",
      rating: "4.8",
      reviews: "0",
      image: "",
      badge: "",
      benefits: "Hydrating,Barrier support",
      status: "draft",
    });
  };

  const resetVariantDraft = () => {
    setEditingVariantId("");
    setVariantDraft({
      productId: products[0]?.id || "",
      sku: "",
      shadeName: "",
      priceOverride: "",
    });
  };

  const resetInventoryDraft = () => {
    setEditingInventoryId("");
    setInventoryDraft({
      variantId: variants[0]?.id || "",
      quantity: "0",
      location: "main-warehouse",
    });
  };

  const resetCollectionDraft = () => {
    setEditingCollectionId("");
    setCollectionDraft({
      title: "",
      slug: "",
      description: "",
    });
  };

  const resetEditorialDraft = () => {
    setEditingEditorialId("");
    setEditorialDraft({
      sectionId: "",
      content: '{\n  "copy": "Add content",\n  "version": 1\n}',
      isActive: true,
    });
  };

  const getContentVersion = (content: string) => {
    try {
      const parsed = JSON.parse(content || "{}");
      const version = Number(parsed.version);
      return Number.isFinite(version) && version > 0 ? version : 1;
    } catch {
      return 1;
    }
  };

  const onSaveProduct = async () => {
    try {
      setCmsError("");
      if (
        !productDraft.name.trim() ||
        !productDraft.slug.trim() ||
        !productDraft.category.trim() ||
        !productDraft.description.trim() ||
        !productDraft.image.trim()
      ) {
        setCmsError(
          "Product requires name, slug, category, description, and image.",
        );
        return;
      }

      const payload = {
        name: productDraft.name.trim(),
        slug: slugify(productDraft.slug),
        category: productDraft.category.trim(),
        description: productDraft.description.trim(),
        price: Math.max(0, Number(productDraft.price) || 0),
        rating: Math.max(0, Number(productDraft.rating) || 0),
        reviews: Math.max(0, Number(productDraft.reviews) || 0),
        image: productDraft.image.trim(),
        badge: productDraft.badge.trim() || undefined,
        benefits: productDraft.benefits.trim(),
        status: productDraft.status === "published" ? "published" : "draft",
      };

      if (editingProductId) {
        await productMutation.update(editingProductId, payload);
      } else {
        await productMutation.create(payload);
      }
      resetProductDraft();
    } catch (error) {
      setCmsError(
        error instanceof Error ? error.message : "Failed to save product.",
      );
    }
  };

  const onSaveVariant = async () => {
    try {
      setCmsError("");
      if (!variantDraft.productId || !variantDraft.sku.trim()) {
        setCmsError("Variant requires product and SKU.");
        return;
      }
      const payload = {
        productId: variantDraft.productId,
        sku: variantDraft.sku.trim().toUpperCase(),
        shadeName: variantDraft.shadeName.trim() || undefined,
        priceOverride: variantDraft.priceOverride.trim()
          ? Math.max(0, Number(variantDraft.priceOverride))
          : undefined,
      };
      if (editingVariantId) {
        await variantMutation.update(editingVariantId, payload);
      } else {
        await variantMutation.create(payload);
      }
      resetVariantDraft();
    } catch (error) {
      setCmsError(
        error instanceof Error ? error.message : "Failed to save variant.",
      );
    }
  };

  const onSaveInventory = async () => {
    try {
      setCmsError("");
      if (!inventoryDraft.variantId || !inventoryDraft.location.trim()) {
        setCmsError("Inventory requires variant and location.");
        return;
      }
      const payload = {
        variantId: inventoryDraft.variantId,
        quantity: Math.max(0, Math.floor(Number(inventoryDraft.quantity) || 0)),
        location: inventoryDraft.location.trim(),
      };
      if (editingInventoryId) {
        await inventoryMutation.update(editingInventoryId, payload);
      } else {
        await inventoryMutation.create(payload);
      }
      resetInventoryDraft();
    } catch (error) {
      setCmsError(
        error instanceof Error ? error.message : "Failed to save inventory.",
      );
    }
  };

  const onSaveCollection = async () => {
    try {
      setCmsError("");
      if (!collectionDraft.title.trim()) {
        setCmsError("Collection title is required.");
        return;
      }
      const payload = {
        title: collectionDraft.title.trim(),
        slug: slugify(collectionDraft.slug || collectionDraft.title),
        description: collectionDraft.description.trim() || undefined,
      };
      if (editingCollectionId) {
        await collectionMutation.update(editingCollectionId, payload);
      } else {
        await collectionMutation.create(payload);
      }
      resetCollectionDraft();
    } catch (error) {
      setCmsError(
        error instanceof Error ? error.message : "Failed to save collection.",
      );
    }
  };

  const onSaveEditorial = async () => {
    try {
      setCmsError("");
      if (!editorialDraft.sectionId.trim() || !editorialDraft.content.trim()) {
        setCmsError("Editorial block requires section ID and content.");
        return;
      }

      const previousVersion =
        editingEditorialId &&
        editorialBlocks.find((item) => item.id === editingEditorialId)
          ? getContentVersion(
              editorialBlocks.find((item) => item.id === editingEditorialId)!
                .content,
            )
          : 0;

      let parsed;
      try {
        parsed = JSON.parse(editorialDraft.content);
      } catch {
        parsed = { copy: editorialDraft.content };
      }

      const nextPayload = JSON.stringify(
        {
          ...parsed,
          version: previousVersion + 1,
        },
        null,
        2,
      );

      const payload = {
        sectionId: editorialDraft.sectionId.trim(),
        content: nextPayload,
        isActive: editorialDraft.isActive,
      };

      if (editingEditorialId) {
        await editorialMutation.update(editingEditorialId, payload);
      } else {
        await editorialMutation.create(payload);
      }

      resetEditorialDraft();
    } catch (error) {
      setCmsError(
        error instanceof Error
          ? error.message
          : "Failed to save editorial block.",
      );
    }
  };

  if (authPending || dataPending) {
    return (
      <main className="cms-page">
        <div className="cms-shell">
          <h1>Loading CMS...</h1>
        </div>
      </main>
    );
  }

  if (authError || dataError) {
    return (
      <main className="cms-page">
        <div className="cms-shell">
          <h1>CMS unavailable</h1>
          <p>{(authError || dataError)?.message}</p>
        </div>
      </main>
    );
  }

  if (isAnonymous) {
    return (
      <main className="cms-page">
        <div className="cms-shell">
          <h1>Catalog CMS</h1>
          <p>
            Sign in to manage products, variants, inventory, and editorial
            content.
          </p>
          <button className="primary-button" onClick={() => void login()}>
            Sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="cms-page">
      <div className="cms-shell">
        <div className="cms-header">
          <div>
            <p className="eyebrow">Owner workspace</p>
            <h1>Catalog CMS</h1>
          </div>
          <div className="cms-user">
            <span>{user?.email}</span>
            <Link to="/" className="cms-link">
              View storefront
            </Link>
          </div>
        </div>

        <section className="cms-panel">
          <h2>K-beauty assortment blueprint</h2>
          <p className="cms-note">
            Compliance-safe model for K-beauty merchandising. This maps each
            planned item to Product, ProductVariant, Inventory, Collection, and
            product EditorialBlock payload keys with explicit inspired-by
            wording.
          </p>
          <div className="cms-table">
            {K_BEAUTY_ASSORTMENT_BLUEPRINT.map((item) => (
              <div key={item.slug} className="cms-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.category} · {item.routineStep}
                  </span>
                </div>
                <div>
                  <span>
                    Product + Variant + Inventory + Collection(
                    {K_BEAUTY_COLLECTION_SLUG})
                  </span>
                </div>
                <div>
                  <span>
                    {item.skinConcern} · {item.finish} · Seed qty{" "}
                    {item.seedQuantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="cms-note">
            Product editorial JSON keys for this assortment:{" "}
            <code>routineStep</code>, <code>skinConcern</code>,{" "}
            <code>finish</code>, <code>inspiredByCopy</code>,{" "}
            <code>sourceTransparencyNote</code>, plus existing{" "}
            <code>shades</code>, <code>benefits</code>,{" "}
            <code>collectionSlugs</code>, and <code>selectionGuide</code>.
          </p>
        </section>

        <div className="cms-tabs">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {cmsError && <p className="cms-error">{cmsError}</p>}

        {activeTab === "products" && (
          <section className="cms-panel">
            <h2>{editingProductId ? "Edit product" : "Create product"}</h2>
            <div className="cms-form-grid">
              <label>
                Name
                <input
                  value={productDraft.name}
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Slug
                <input
                  value={productDraft.slug}
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Category
                <input
                  value={productDraft.category}
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Image URL
                <input
                  value={productDraft.image}
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      image: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Price
                <input
                  type="number"
                  step="0.01"
                  value={productDraft.price}
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Status
                <select
                  value={productDraft.status}
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label>
                Rating
                <input
                  type="number"
                  step="0.1"
                  value={productDraft.rating}
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      rating: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Reviews
                <input
                  type="number"
                  value={productDraft.reviews}
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      reviews: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Badge
                <input
                  value={productDraft.badge}
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      badge: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="wide">
                Benefits (comma-separated)
                <input
                  value={productDraft.benefits}
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      benefits: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="wide">
                Description
                <textarea
                  value={productDraft.description}
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="cms-actions">
              <button
                className="primary-button"
                onClick={() => void onSaveProduct()}
                disabled={mutating}
              >
                {editingProductId ? "Update product" : "Create product"}
              </button>
              <button className="cms-link" onClick={resetProductDraft}>
                Clear
              </button>
            </div>

            <div className="cms-table">
              {products.map((product) => (
                <div key={product.id} className="cms-row">
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.slug}</span>
                  </div>
                  <div>
                    <span
                      className={
                        product.status === "published" ? "published" : "draft"
                      }
                    >
                      {product.status}
                    </span>
                  </div>
                  <div className="cms-row-actions">
                    <button
                      onClick={() => {
                        setEditingProductId(product.id);
                        setProductDraft({
                          name: product.name || "",
                          slug: product.slug || "",
                          category: product.category || "",
                          description: product.description || "",
                          price: String(product.price || 0),
                          rating: String(product.rating || 0),
                          reviews: String(product.reviews || 0),
                          image: product.image || "",
                          badge: product.badge || "",
                          benefits: product.benefits || "",
                          status: product.status || "draft",
                        });
                      }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() =>
                        void productMutation.update(product.id, {
                          status:
                            product.status === "published"
                              ? "draft"
                              : "published",
                        })
                      }
                    >
                      {product.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => void productMutation.remove(product.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "variants" && (
          <section className="cms-panel">
            <h2>{editingVariantId ? "Edit variant" : "Create variant"}</h2>
            <div className="cms-form-grid">
              <label>
                Product
                <select
                  value={variantDraft.productId}
                  onChange={(event) =>
                    setVariantDraft((current) => ({
                      ...current,
                      productId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                SKU
                <input
                  value={variantDraft.sku}
                  onChange={(event) =>
                    setVariantDraft((current) => ({
                      ...current,
                      sku: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Option value
                <input
                  value={variantDraft.shadeName}
                  onChange={(event) =>
                    setVariantDraft((current) => ({
                      ...current,
                      shadeName: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Price override
                <input
                  type="number"
                  step="0.01"
                  value={variantDraft.priceOverride}
                  onChange={(event) =>
                    setVariantDraft((current) => ({
                      ...current,
                      priceOverride: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="cms-actions">
              <button
                className="primary-button"
                onClick={() => void onSaveVariant()}
                disabled={mutating}
              >
                {editingVariantId ? "Update variant" : "Create variant"}
              </button>
              <button className="cms-link" onClick={resetVariantDraft}>
                Clear
              </button>
            </div>

            <div className="cms-table">
              {variants.map((variant) => (
                <div key={variant.id} className="cms-row">
                  <div>
                    <strong>{variant.sku}</strong>
                    <span>{variant.shadeName || "Default option"}</span>
                  </div>
                  <div>
                    <span>
                      {products.find((item) => item.id === variant.productId)
                        ?.name || "Unknown product"}
                    </span>
                  </div>
                  <div className="cms-row-actions">
                    <button
                      onClick={() => {
                        setEditingVariantId(variant.id);
                        setVariantDraft({
                          productId: variant.productId || "",
                          sku: variant.sku || "",
                          shadeName: variant.shadeName || "",
                          priceOverride:
                            variant.priceOverride !== undefined
                              ? String(variant.priceOverride)
                              : "",
                        });
                      }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => void variantMutation.remove(variant.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "inventory" && (
          <section className="cms-panel">
            <h2>
              {editingInventoryId ? "Edit stock row" : "Create stock row"}
            </h2>
            <div className="cms-form-grid">
              <label>
                Variant
                <select
                  value={inventoryDraft.variantId}
                  onChange={(event) =>
                    setInventoryDraft((current) => ({
                      ...current,
                      variantId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select variant</option>
                  {variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.sku}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Location
                <input
                  value={inventoryDraft.location}
                  onChange={(event) =>
                    setInventoryDraft((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Quantity
                <input
                  type="number"
                  value={inventoryDraft.quantity}
                  onChange={(event) =>
                    setInventoryDraft((current) => ({
                      ...current,
                      quantity: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="cms-actions">
              <button
                className="primary-button"
                onClick={() => void onSaveInventory()}
                disabled={mutating}
              >
                {editingInventoryId ? "Update inventory" : "Create inventory"}
              </button>
              <button className="cms-link" onClick={resetInventoryDraft}>
                Clear
              </button>
            </div>

            <div className="cms-table">
              {inventory.map((stockRow) => (
                <div key={stockRow.id} className="cms-row">
                  <div>
                    <strong>
                      {variants.find((item) => item.id === stockRow.variantId)
                        ?.sku || "Unknown SKU"}
                    </strong>
                    <span>{stockRow.location}</span>
                  </div>
                  <div>
                    <span>{stockRow.quantity} in stock</span>
                  </div>
                  <div className="cms-row-actions">
                    <button
                      onClick={() => {
                        setEditingInventoryId(stockRow.id);
                        setInventoryDraft({
                          variantId: stockRow.variantId || "",
                          quantity: String(stockRow.quantity || 0),
                          location: stockRow.location || "",
                        });
                      }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => void inventoryMutation.remove(stockRow.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "collections" && (
          <section className="cms-panel">
            <h2>
              {editingCollectionId ? "Edit collection" : "Create collection"}
            </h2>
            <div className="cms-form-grid">
              <label>
                Title
                <input
                  value={collectionDraft.title}
                  onChange={(event) =>
                    setCollectionDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Slug
                <input
                  value={collectionDraft.slug}
                  onChange={(event) =>
                    setCollectionDraft((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="wide">
                Description
                <textarea
                  value={collectionDraft.description}
                  onChange={(event) =>
                    setCollectionDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="cms-actions">
              <button
                className="primary-button"
                onClick={() => void onSaveCollection()}
                disabled={mutating}
              >
                {editingCollectionId
                  ? "Update collection"
                  : "Create collection"}
              </button>
              <button className="cms-link" onClick={resetCollectionDraft}>
                Clear
              </button>
            </div>

            <div className="cms-table">
              {collections.map((collection) => (
                <div key={collection.id} className="cms-row">
                  <div>
                    <strong>{collection.title}</strong>
                    <span>{collection.slug}</span>
                  </div>
                  <div>
                    <span>{collection.description || "No description"}</span>
                  </div>
                  <div className="cms-row-actions">
                    <button
                      onClick={() => {
                        setEditingCollectionId(collection.id);
                        setCollectionDraft({
                          title: collection.title || "",
                          slug: collection.slug || "",
                          description: collection.description || "",
                        });
                      }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() =>
                        void collectionMutation.remove(collection.id)
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "editorial" && (
          <section className="cms-panel">
            <h2>
              {editingEditorialId
                ? "Edit editorial block"
                : "Create editorial block"}
            </h2>
            <div className="cms-form-grid">
              <label>
                Section ID
                <input
                  value={editorialDraft.sectionId}
                  onChange={(event) =>
                    setEditorialDraft((current) => ({
                      ...current,
                      sectionId: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="cms-checkbox">
                Active
                <input
                  type="checkbox"
                  checked={editorialDraft.isActive}
                  onChange={(event) =>
                    setEditorialDraft((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                />
              </label>
              <label className="wide">
                Content JSON
                <textarea
                  className="code-input"
                  value={editorialDraft.content}
                  onChange={(event) =>
                    setEditorialDraft((current) => ({
                      ...current,
                      content: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <p className="cms-note">
              Saving an editorial block automatically increments{" "}
              <code>version</code>. Supported merchandising sections:{" "}
              <code>home:hero</code>, <code>home:principles</code>,{" "}
              <code>home:collections</code>, <code>home:promos</code>,{" "}
              <code>home:shop</code>, <code>home:story</code>,{" "}
              <code>home:newsletter</code>, and product blocks{" "}
              <code>product:{"<productId>"}</code> with keys for PDP support and
              K-beauty metadata (<code>routineStep</code>,{" "}
              <code>skinConcern</code>, <code>finish</code>,{" "}
              <code>inspiredByCopy</code>, <code>sourceTransparencyNote</code>).
              Keep language as inspired-by trends only and avoid endorsement
              claims.
            </p>
            <div className="cms-actions">
              <button
                className="primary-button"
                onClick={() => void onSaveEditorial()}
                disabled={mutating}
              >
                {editingEditorialId ? "Update block" : "Create block"}
              </button>
              <button className="cms-link" onClick={resetEditorialDraft}>
                Clear
              </button>
            </div>

            <div className="cms-table">
              {editorialBlocks.map((block) => (
                <div key={block.id} className="cms-row">
                  <div>
                    <strong>{block.sectionId}</strong>
                    <span>v{getContentVersion(block.content)}</span>
                  </div>
                  <div>
                    <span>{block.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="cms-row-actions">
                    <button
                      onClick={() => {
                        setEditingEditorialId(block.id);
                        setEditorialDraft({
                          sectionId: block.sectionId || "",
                          content: (() => {
                            try {
                              return JSON.stringify(
                                JSON.parse(block.content || "{}"),
                                null,
                                2,
                              );
                            } catch {
                              return block.content || "";
                            }
                          })(),
                          isActive: Boolean(block.isActive),
                        });
                      }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() =>
                        void editorialMutation.update(block.id, {
                          isActive: !block.isActive,
                        })
                      }
                    >
                      {block.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => void editorialMutation.remove(block.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Link to="/" className="wordmark">
          BLOOM<span>$</span>BALANCE
        </Link>
        <p>Beauty that makes room for you.</p>
      </div>
      <div>
        <strong>Shop</strong>
        <a href="#shop">Skincare</a>
        <a href="#shop">Korean Skincare</a>
        <a href="#shop">Makeup</a>
        <a href="#shop">Body</a>
        <a href="#shop">Beauty Accessories</a>
        <a href="#shop">Supplements</a>
        <a href="#shop">Facial Tools</a>
      </div>
      <div>
        <strong>About</strong>
        <a href="#story">Our philosophy</a>
        <a href="#story">Ingredients</a>
        <a href="#story">Sustainability</a>
      </div>
      <div>
        <strong>Help</strong>
        <a href="#contact">Contact</a>
        <a href="#shipping">Shipping & returns</a>
        <a href="#faq">FAQ</a>
      </div>
      <p className="copyright">© 2026 Bloom$Balance. All rights reserved.</p>
    </footer>
  );
}

function normalizeCatalog(
  productsData: any[] | undefined,
  variantsData: any[] | undefined,
  collectionsData: any[] | undefined,
  editorialData: any[] | undefined,
) {
  const safeProducts = productsData || [];
  const safeVariants = variantsData || [];
  const safeCollections = collectionsData || [];
  const safeEditorial = editorialData || [];

  const publishedProducts = safeProducts.filter(
    (product) => product.status === "published",
  );

  const slugSet = new Set<string>();
  const skuSet = new Set<string>();
  const productContentById: ProductContentMap = {};
  const inventoryByVariantId = new Map<string, number>();

  const productEditorial = safeEditorial.filter(
    (block) =>
      typeof block.sectionId === "string" &&
      block.sectionId.startsWith("product:"),
  );

  productEditorial.forEach((block) => {
    const [, productId] = block.sectionId.split(":");
    if (!productId || !block.isActive) return;
    try {
      const parsed = JSON.parse(block.content || "{}");
      const shades = Array.isArray(parsed.shades)
        ? parsed.shades.filter((shade: string) => typeof shade === "string")
        : [];
      const benefits = Array.isArray(parsed.benefits)
        ? parsed.benefits.filter(
            (benefit: string) => typeof benefit === "string",
          )
        : [];
      const version = Number(parsed.version || 1);
      const collectionSlugs = Array.isArray(parsed.collectionSlugs)
        ? parsed.collectionSlugs.filter(
            (item: string) => typeof item === "string",
          )
        : [];
      productContentById[productId] = {
        shades,
        benefits,
        version: Number.isFinite(version) ? Math.max(1, version) : 1,
        collectionSlugs,
        howToUse:
          typeof parsed.howToUse === "string" ? parsed.howToUse.trim() : "",
        fullDetails:
          typeof parsed.fullDetails === "string"
            ? parsed.fullDetails.trim()
            : "",
        selectionLabel:
          typeof parsed.selectionLabel === "string"
            ? parsed.selectionLabel.trim()
            : "",
        guide:
          parsed.selectionGuide && typeof parsed.selectionGuide === "object"
            ? parsed.selectionGuide
            : undefined,
        routineStep:
          typeof parsed.routineStep === "string"
            ? parsed.routineStep.trim()
            : "",
        skinConcern:
          typeof parsed.skinConcern === "string"
            ? parsed.skinConcern.trim()
            : "",
        finish: typeof parsed.finish === "string" ? parsed.finish.trim() : "",
        inspiredByCopy:
          typeof parsed.inspiredByCopy === "string"
            ? parsed.inspiredByCopy.trim()
            : "",
        sourceTransparencyNote:
          typeof parsed.sourceTransparencyNote === "string"
            ? parsed.sourceTransparencyNote.trim()
            : "",
      };
    } catch {
      productContentById[productId] = {
        shades: [],
        benefits: [],
        version: 1,
        collectionSlugs: [],
        routineStep: "",
        skinConcern: "",
        finish: "",
        inspiredByCopy: "",
        sourceTransparencyNote: "",
      };
    }
  });

  safeCollections.forEach((collection) => {
    if (collection.slug) slugSet.add(collection.slug);
  });

  const defaultPdpSupport: PdpSupportContent = {
    selectionLabel: "Select variation",
    howToUse: "Product usage details are managed in CMS.",
    fullDetails: "Product details are managed in CMS.",
    guide: {
      eyebrow: "Selection guide",
      title: "Choose your match",
      copy: "Guide content is managed in CMS.",
      steps: [
        { title: "Select", copy: "Pick your preferred option." },
        { title: "Apply", copy: "Start with a light layer." },
        { title: "Build", copy: "Add coverage only where needed." },
      ],
    },
  };

  const normalizedProducts: ProductView[] = publishedProducts
    .filter((product) => {
      const hasRequiredFields =
        typeof product.name === "string" &&
        product.name.trim().length > 0 &&
        typeof product.slug === "string" &&
        product.slug.trim().length > 0 &&
        typeof product.category === "string" &&
        product.category.trim().length > 0 &&
        typeof product.description === "string" &&
        product.description.trim().length > 0 &&
        typeof product.image === "string" &&
        product.image.trim().length > 0 &&
        Number.isFinite(product.price) &&
        product.price >= 0;
      if (!hasRequiredFields) return false;
      if (slugSet.has(product.slug)) {
        return false;
      }
      slugSet.add(product.slug);
      return true;
    })
    .map((product) => {
      const editorial = productContentById[product.id];
      const editorialShades = editorial?.shades || [];
      const variantShades = safeVariants
        .filter((variant) => variant.productId === product.id)
        .map((variant) => normalizeShadeName(variant.shadeName))
        .filter((shade): shade is string => Boolean(shade));
      const uniqueShades = Array.from(
        new Set([...editorialShades, ...variantShades]),
      );
      const shades = uniqueShades.length > 0 ? uniqueShades : ["Original"];

      const benefitsFromProduct = parseJsonStringArray(product.benefits, []);
      const benefitsFromEditorial = editorial?.benefits || [];
      const benefits = Array.from(
        new Set([...benefitsFromProduct, ...benefitsFromEditorial]),
      );
      const safeBenefits =
        benefits.length > 0 ? benefits : ["Thoughtful formula"];

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        description: product.description,
        price: product.price,
        rating: Number.isFinite(product.rating) ? product.rating : 4.8,
        reviews: Number.isFinite(product.reviews) ? product.reviews : 0,
        image: product.image,
        badge: product.badge || undefined,
        shades,
        benefits: safeBenefits,
        status: product.status,
        version: editorial?.version || 1,
        collectionSlugs: (editorial?.collectionSlugs || []).filter((slug) =>
          safeCollections.some((collection) => collection.slug === slug),
        ),
        pdpSupport: {
          selectionLabel:
            editorial?.selectionLabel || defaultPdpSupport.selectionLabel,
          howToUse: editorial?.howToUse || defaultPdpSupport.howToUse,
          fullDetails: editorial?.fullDetails || defaultPdpSupport.fullDetails,
          guide: parseProductGuide(editorial?.guide, defaultPdpSupport.guide),
        },
        routineProfile: {
          routineStep: withDefaultString(
            editorial?.routineStep,
            inferRoutineStep(product.category, product.name),
          ),
          skinConcern: withDefaultString(
            editorial?.skinConcern,
            inferSkinConcern(product.category, product.description),
          ),
          finish: withDefaultString(
            editorial?.finish,
            inferFinish(product.name, product.description),
          ),
          inspiredByCopy: normalizeInspiredByCopy(
            withDefaultString(editorial?.inspiredByCopy, ""),
            inferInspiredByCopy(product.name, product.category),
          ),
          sourceTransparencyNote: withDefaultString(
            editorial?.sourceTransparencyNote,
            inferSourceTransparencyNote(product.name),
          ),
        },
      };
    });

  safeVariants.forEach((variant) => {
    if (variant.sku) {
      if (skuSet.has(variant.sku)) {
        return;
      }
      skuSet.add(variant.sku);
    }
  });

  return {
    products: normalizedProducts,
    hasValidUniqueSkus:
      skuSet.size === safeVariants.filter((item) => Boolean(item.sku)).length,
    hasValidUniqueSlugs:
      normalizedProducts.length ===
      new Set(normalizedProducts.map((item) => item.slug)).size,
    inventoryByVariantId,
    collections: safeCollections
      .filter(
        (collection) =>
          typeof collection.title === "string" &&
          typeof collection.slug === "string",
      )
      .map((collection) => ({
        id: collection.id,
        title: collection.title.trim(),
        slug: collection.slug.trim(),
        description: (collection.description || "").trim(),
      })),
  };
}

function useCommerceDomain() {
  const productsResult = useQuery("Product", {
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });
  const variantsResult = useQuery("ProductVariant", {
    orderBy: { createdAt: "asc" },
  });
  const inventoryResult = useQuery("Inventory", {
    orderBy: { createdAt: "asc" },
  });
  const collectionsResult = useQuery("Collection", {
    orderBy: { createdAt: "desc" },
  });
  const editorialResult = useQuery("EditorialBlock", {
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });

  const combinedPending =
    productsResult.isPending ||
    variantsResult.isPending ||
    inventoryResult.isPending ||
    collectionsResult.isPending ||
    editorialResult.isPending;

  const combinedError =
    productsResult.error ||
    variantsResult.error ||
    inventoryResult.error ||
    collectionsResult.error ||
    editorialResult.error ||
    null;

  const domain = useMemo(
    () =>
      normalizeCatalog(
        productsResult.data,
        variantsResult.data,
        collectionsResult.data,
        editorialResult.data,
      ),
    [
      productsResult.data,
      variantsResult.data,
      collectionsResult.data,
      editorialResult.data,
    ],
  );

  const homeContent = useMemo<HomeContent>(() => {
    const blocks = editorialResult.data || [];
    const getBySection = (sectionId: string) =>
      blocks.find((block) => block.sectionId === sectionId);

    const heroPayload = parseEditorialPayload(
      getBySection("home:hero")?.content,
    );
    const principlesPayload = parseEditorialPayload(
      getBySection("home:principles")?.content,
    );
    const shopPayload = parseEditorialPayload(
      getBySection("home:shop")?.content,
    );
    const storyPayload = parseEditorialPayload(
      getBySection("home:story")?.content,
    );
    const newsletterPayload = parseEditorialPayload(
      getBySection("home:newsletter")?.content,
    );
    const promosPayload = parseEditorialPayload(
      getBySection("home:promos")?.content,
    );
    const collectionsPayload = parseEditorialPayload(
      getBySection("home:collections")?.content,
    );

    return {
      hero: {
        eyebrow: withDefaultString(heroPayload.eyebrow, "Home hero"),
        title: withDefaultString(heroPayload.title, "Define title in CMS"),
        titleAccent: withDefaultString(
          heroPayload.titleAccent,
          "for storefront",
        ),
        copy: withDefaultString(
          heroPayload.copy,
          "Add hero copy in home:hero.",
        ),
        ctaLabel: withDefaultString(heroPayload.ctaLabel, "Shop now"),
        image: withDefaultString(heroPayload.image, ""),
        note: withDefaultString(heroPayload.note, "Managed from CMS"),
      },
      shop: {
        eyebrow: withDefaultString(shopPayload.eyebrow, "Catalog"),
        title: withDefaultString(shopPayload.title, "Shop products"),
        copy: withDefaultString(
          shopPayload.copy,
          "Merchandising copy managed in CMS.",
        ),
      },
      story: {
        eyebrow: withDefaultString(storyPayload.eyebrow, "Story"),
        title: withDefaultString(storyPayload.title, "Share your brand story"),
        copy: withDefaultString(
          storyPayload.copy,
          "Add story copy in home:story.",
        ),
        ctaLabel: withDefaultString(storyPayload.ctaLabel, "Shop products"),
        image: withDefaultString(storyPayload.image, ""),
      },
      newsletter: {
        eyebrow: withDefaultString(newsletterPayload.eyebrow, "Newsletter"),
        title: withDefaultString(
          newsletterPayload.title,
          "Keep customers updated",
        ),
        copy: withDefaultString(
          newsletterPayload.copy,
          "Add newsletter pitch in CMS.",
        ),
        buttonLabel: withDefaultString(
          newsletterPayload.buttonLabel,
          "Subscribe",
        ),
        placeholder: withDefaultString(
          newsletterPayload.placeholder,
          "Email address",
        ),
      },
      principles: parsePrinciples(principlesPayload.items),
      promos: parsePromos(promosPayload.modules),
      collections: {
        eyebrow: withDefaultString(collectionsPayload.eyebrow, "Collections"),
        title: withDefaultString(
          collectionsPayload.title,
          "Shop by collection",
        ),
        copy: withDefaultString(
          collectionsPayload.copy,
          "Choose a curated collection to filter the catalog.",
        ),
        featuredSlugs: Array.isArray(collectionsPayload.featuredSlugs)
          ? collectionsPayload.featuredSlugs.filter(
              (slug): slug is string => typeof slug === "string",
            )
          : [],
      },
    };
  }, [editorialResult.data]);

  useEffect(() => {
    const stockMap = new Map<string, number>();
    (inventoryResult.data || []).forEach((entry) => {
      if (!entry.variantId) return;
      stockMap.set(
        entry.variantId,
        (stockMap.get(entry.variantId) || 0) + entry.quantity,
      );
    });
    domain.inventoryByVariantId.clear();
    stockMap.forEach((qty, key) => domain.inventoryByVariantId.set(key, qty));
  }, [inventoryResult.data, domain.inventoryByVariantId]);

  return {
    products: domain.products,
    collections: domain.collections,
    homeContent,
    isPending: combinedPending,
    error: combinedError,
    schemaHealth: {
      uniqueSlugs: domain.hasValidUniqueSlugs,
      uniqueSkus: domain.hasValidUniqueSkus,
      collectionCount: domain.collections.length,
    },
  };
}

function ProductRoute({
  products,
  onAdd,
  isPending,
  error,
  wishlistProductIds,
  onToggleWishlist,
}: {
  products: ProductView[];
  onAdd: (product: ProductView, shade?: string, quantity?: number) => void;
  isPending: boolean;
  error: Error | null;
  wishlistProductIds: Set<string>;
  onToggleWishlist: (product: ProductView) => void;
}) {
  const { slug } = useParams();
  const product = products.find((item) => item.slug === slug);

  return (
    <ProductPage
      products={products}
      onAdd={onAdd}
      isPending={isPending}
      error={error}
      isWishlisted={product ? wishlistProductIds.has(product.id) : false}
      onToggleWishlist={onToggleWishlist}
    />
  );
}

function Storefront() {
  const { user, isPending: authPending } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [savedCarts, setSavedCarts] = useState<SavedCartSnapshot[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const cartStorageKey = user?.id
    ? `bloom-balance-cart:${user.id}`
    : "bloom-balance-cart:guest";
  const wishlistStorageKey = user?.id
    ? `bloom-balance-wishlist:${user.id}`
    : "bloom-balance-wishlist:guest";
  const savedCartStorageKey = user?.id
    ? `bloom-balance-saved-cart:${user.id}`
    : "bloom-balance-saved-cart:guest";

  const { products, collections, homeContent, isPending, error, schemaHealth } =
    useCommerceDomain();

  useEffect(() => {
    if (authPending) return;

    try {
      const parsedCart = JSON.parse(
        localStorage.getItem(cartStorageKey) || "[]",
      );
      setCart(Array.isArray(parsedCart) ? parsedCart : []);
    } catch {
      setCart([]);
    }

    try {
      const parsedWishlist = JSON.parse(
        localStorage.getItem(wishlistStorageKey) || "[]",
      );
      setWishlistItems(Array.isArray(parsedWishlist) ? parsedWishlist : []);
    } catch {
      setWishlistItems([]);
    }

    try {
      const parsedSavedCart = JSON.parse(
        localStorage.getItem(savedCartStorageKey) || "[]",
      );

      if (!Array.isArray(parsedSavedCart)) {
        setSavedCarts([]);
      } else if (
        parsedSavedCart.length &&
        parsedSavedCart[0] &&
        "items" in parsedSavedCart[0]
      ) {
        setSavedCarts(parsedSavedCart);
      } else if (
        parsedSavedCart.length &&
        parsedSavedCart[0] &&
        "product" in parsedSavedCart[0]
      ) {
        setSavedCarts([
          {
            id: `legacy-${Date.now()}`,
            createdAt: new Date().toISOString(),
            items: parsedSavedCart,
          },
        ]);
      } else {
        setSavedCarts([]);
      }
    } catch {
      setSavedCarts([]);
    }
  }, [authPending, cartStorageKey, wishlistStorageKey, savedCartStorageKey]);

  useEffect(() => {
    if (authPending) return;
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  }, [authPending, cart, cartStorageKey]);

  useEffect(() => {
    if (authPending) return;
    localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlistItems));
  }, [authPending, wishlistItems, wishlistStorageKey]);

  useEffect(() => {
    if (authPending) return;
    localStorage.setItem(savedCartStorageKey, JSON.stringify(savedCarts));
  }, [authPending, savedCarts, savedCartStorageKey]);

  const wishlistProductIds = useMemo(
    () => new Set(wishlistItems.map((item) => item.productId)),
    [wishlistItems],
  );

  const addToCart = (
    product: ProductView,
    shade = product.shades[0],
    quantity = 1,
  ) => {
    setCart((current) => {
      const index = current.findIndex(
        (item) => item.product.id === product.id && item.shade === shade,
      );
      if (index < 0) return [...current, { product, shade, quantity }];
      return current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );
    });
    setCartOpen(true);
  };

  const toggleWishlist = (product: ProductView) => {
    setWishlistItems((current) => {
      const existingIndex = current.findIndex(
        (item) => item.productId === product.id,
      );
      if (existingIndex >= 0) {
        return current.filter((item) => item.productId !== product.id);
      }
      return [
        { productId: product.id, addedAt: new Date().toISOString() },
        ...current,
      ];
    });
  };

  const saveCartForLater = () => {
    if (!cart.length) return;

    const snapshot: SavedCartSnapshot = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      items: cart.map((item) => ({ ...item })),
    };

    setSavedCarts((current) => [snapshot, ...current].slice(0, 5));
  };

  const restoreSavedCart = (snapshotId?: string) => {
    const target = snapshotId
      ? savedCarts.find((snapshot) => snapshot.id === snapshotId)
      : savedCarts[0];

    if (!target) return;
    setCart(target.items.map((item) => ({ ...item })));
    setCartOpen(true);
  };

  const latestSavedCartItemCount = savedCarts[0]
    ? savedCarts[0].items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const restoreLatestSavedCart = useCallback(() => {
    restoreSavedCart();
  }, [savedCarts]);

  const handleCheckoutSuccess = () => {
    setCart([]);
    localStorage.removeItem(cartStorageKey);
  };

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header cartCount={cartCount} onCart={() => setCartOpen(true)} />
      {!schemaHealth.uniqueSlugs || !schemaHealth.uniqueSkus ? (
        <div className="offer-bar">
          Catalog schema warning: fix duplicate product slugs or variant SKUs in
          CMS.
        </div>
      ) : null}
      <Routes>
        <Route path="/cms" element={<CmsPage />} />
        <Route
          path="/account"
          element={
            <AccountPage
              products={products}
              wishlistItems={wishlistItems}
              onToggleWishlist={toggleWishlist}
              savedCarts={savedCarts}
              onRestoreSavedCart={restoreSavedCart}
              onAddToCart={addToCart}
            />
          }
        />
        <Route
          path="/"
          element={
            <Home
              products={products}
              onAdd={addToCart}
              isPending={isPending}
              error={error}
              homeContent={homeContent}
              collections={collections}
              wishlistProductIds={wishlistProductIds}
              onToggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/product/:slug"
          element={
            <ProductRoute
              products={products}
              onAdd={addToCart}
              isPending={isPending}
              error={error}
              wishlistProductIds={wishlistProductIds}
              onToggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <CheckoutPage
              cart={cart}
              onCheckoutSuccess={handleCheckoutSuccess}
            />
          }
        />
        <Route path="/order/:orderNumber" element={<OrderConfirmationPage />} />
      </Routes>
      <Footer />
      <CartDrawer
        items={cart}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onUpdate={(index, quantity) =>
          setCart((current) =>
            current.map((item, itemIndex) =>
              itemIndex === index ? { ...item, quantity } : item,
            ),
          )
        }
        onRemove={(index) =>
          setCart((current) =>
            current.filter((_, itemIndex) => itemIndex !== index),
          )
        }
        onSaveCart={saveCartForLater}
        onRestoreCart={restoreLatestSavedCart}
        savedCartCount={latestSavedCartItemCount}
      />
    </div>
  );
}

export const App = () => (
  <BrowserRouter>
    <Storefront />
  </BrowserRouter>
);
