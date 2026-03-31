import type { AffiliateProduct } from "../types";

export function AffiliateCarousel({ products }: { products: AffiliateProduct[] }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Affiliate Picks</h2>
      </div>
      <div className="affiliate-marquee">
        <div className="affiliate-track">
          {[...products, ...products].map((product, index) => (
            <a
              className="affiliate-card"
              key={`${product.id}-${index}`}
              href={product.affiliateLink}
              target="_blank"
              rel="noreferrer"
            >
              <img src={product.imageUrl} alt={product.name} />
              <div>
                <strong>{product.name}</strong>
                <p>{product.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
